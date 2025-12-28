#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface FileMapping {
  oldPath: string;
  newPath: string;
}

class TypeScriptLowercaser {
  private fileMappings: FileMapping[] = [];
  private rootDir: string;
  private dryRun: boolean;
  private gitIgnoredPaths: Set<string> = new Set();

  constructor(rootDir: string = '.', dryRun: boolean = false) {
    this.rootDir = path.resolve(rootDir);
    this.dryRun = dryRun;
    this.loadGitIgnore();
  }

  // Convert PascalCase to kebab-case
  private toKebabCase(str: string): string {
    return str
      // Insert hyphen before uppercase letters (except at start)
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      // Insert hyphen before uppercase letter followed by lowercase
      .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
      // Convert to lowercase
      .toLowerCase();
  }

  // Convert filename/folder to kebab-case
  private convertToKebabCase(name: string): string {
    const ext = path.extname(name);
    const baseName = path.basename(name, ext);
    const kebabName = this.toKebabCase(baseName);
    return kebabName + ext;
  }

  // Load gitignored paths
  private loadGitIgnore(): void {
    try {
      const output = execSync('git ls-files --ignored --exclude-standard --others --directory', {
        cwd: this.rootDir,
        encoding: 'utf-8'
      });
      
      const ignoredPaths = output.trim().split('\n').filter(Boolean);
      for (const ignoredPath of ignoredPaths) {
        const fullPath = path.resolve(this.rootDir, ignoredPath);
        this.gitIgnoredPaths.add(fullPath);
      }
      
      console.log(`Loaded ${this.gitIgnoredPaths.size} gitignored paths\n`);
    } catch (error) {
      console.log('Could not load .gitignore paths, continuing without filtering\n');
    }
  }

  // Check if path is ignored by git
  private isGitIgnored(filePath: string): boolean {
    const absolutePath = path.resolve(filePath);
    
    // Check exact match
    if (this.gitIgnoredPaths.has(absolutePath)) return true;
    if (this.gitIgnoredPaths.has(absolutePath + '/')) return true;
    
    // Check if any parent directory is ignored
    for (const ignoredPath of this.gitIgnoredPaths) {
      if (absolutePath.startsWith(ignoredPath)) return true;
    }
    
    return false;
  }

  // Check if git repo exists
  private checkGitRepo(): void {
    try {
      execSync('git rev-parse --git-dir', { cwd: this.rootDir, stdio: 'ignore' });
    } catch {
      throw new Error('Not a git repository. Please initialize git first.');
    }
  }

  // Get all TS/TSX files and directories
  private getAllPaths(dir: string, results: string[] = []): string[] {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(this.rootDir, fullPath);

      // Skip .git directory
      if (relativePath === '.git' || relativePath.startsWith('.git' + path.sep)) continue;

      // Skip gitignored paths
      if (this.isGitIgnored(fullPath)) {
        continue;
      }

      if (entry.isDirectory()) {
        results.push(fullPath);
        this.getAllPaths(fullPath, results);
      } else if (entry.name.match(/\.(ts|tsx)$/)) {
        results.push(fullPath);
      }
    }

    return results;
  }

  // Generate mappings for files/folders that need renaming
  private generateMappings(): void {
    const allPaths = this.getAllPaths(this.rootDir);
    
    // Sort by depth (deepest first) to handle nested renames
    allPaths.sort((a, b) => b.split(path.sep).length - a.split(path.sep).length);

    for (const oldPath of allPaths) {
      const dirname = path.dirname(oldPath);
      const basename = path.basename(oldPath);
      const kebabCased = this.convertToKebabCase(basename);

      if (basename !== kebabCased) {
        const newPath = path.join(dirname.toLowerCase(), kebabCased);
        this.fileMappings.push({ oldPath, newPath });
      }
    }
  }

  // Rename using git mv to preserve history
  private renameWithGit(): void {
    console.log(`\n${this.dryRun ? '[DRY RUN] ' : ''}Renaming ${this.fileMappings.length} files/folders...\n`);

    for (const { oldPath, newPath } of this.fileMappings) {
      const relativeOld = path.relative(this.rootDir, oldPath);
      const relativeNew = path.relative(this.rootDir, newPath.toLowerCase());

      console.log(`${relativeOld} → ${relativeNew}`);

      if (!this.dryRun) {
        try {
          // Use git mv to preserve history
          execSync(`git mv "${oldPath}" "${newPath}"`, { cwd: this.rootDir });
        } catch (error) {
          console.error(`Error renaming ${relativeOld}:`, error);
        }
      }
    }
  }

  // Update imports in all TS/TSX files
  private updateImports(): void {
    console.log('\n' + (this.dryRun ? '[DRY RUN] ' : '') + 'Updating imports...\n');

    const allFiles = this.getAllPaths(this.rootDir).filter(p => 
      fs.statSync(p).isFile() && p.match(/\.(ts|tsx)$/)
    );

    // Create a map of old paths to new paths (without extensions)
    const pathMap = new Map<string, string>();
    for (const { oldPath, newPath } of this.fileMappings) {
      const oldWithoutExt = oldPath.replace(/\.(ts|tsx)$/, '');
      const newWithoutExt = newPath.replace(/\.(ts|tsx)$/, '');
      pathMap.set(oldWithoutExt, newWithoutExt);
    }

    for (const filePath of allFiles) {
      let content = fs.readFileSync(filePath, 'utf-8');
      let modified = false;
      const fileDir = path.dirname(filePath);

      // Match import/export statements
      const importRegex = /(import|export)(\s+(?:type\s+)?(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)?\s+from\s+['"])([^'"]+)(['"])/g;

      content = content.replace(importRegex, (match, keyword, middle, importPath, quote) => {
        // Skip node_modules and package imports
        if (!importPath.startsWith('.')) return match;

        // Resolve the absolute path of the import
        const resolvedImport = path.resolve(fileDir, importPath);
        
        // Check if this import needs updating
        for (const [oldPath, newPath] of pathMap.entries()) {
          if (resolvedImport === oldPath || resolvedImport.startsWith(oldPath + path.sep)) {
            // Calculate new relative path
            const newResolvedPath = resolvedImport.replace(oldPath, newPath);
            let newRelativePath = path.relative(fileDir, newResolvedPath);
            
            // Ensure relative paths start with ./
            if (!newRelativePath.startsWith('.')) {
              newRelativePath = './' + newRelativePath;
            }

            // Convert Windows paths to Unix-style
            newRelativePath = newRelativePath.split(path.sep).join('/');

            modified = true;
            console.log(`  ${path.relative(this.rootDir, filePath)}: ${importPath} → ${newRelativePath}`);
            return `${keyword}${middle}${newRelativePath}${quote}`;
          }
        }

        return match;
      });

      if (modified && !this.dryRun) {
        fs.writeFileSync(filePath, content, 'utf-8');
      }
    }
  }

  // Main execution
  public execute(): void {
    console.log('TypeScript File Kebab-Caser');
    console.log('============================\n');
    
    this.checkGitRepo();
    console.log('✓ Git repository detected\n');

    this.generateMappings();

    if (this.fileMappings.length === 0) {
      console.log('No files or folders need renaming. Everything is already in kebab-case!');
      return;
    }

    this.renameWithGit();
    this.updateImports();

    if (!this.dryRun) {
      console.log('\n✓ Complete! Review changes with: git status');
      console.log('  Commit changes with: git commit -m "Convert TypeScript files to kebab-case"');
    } else {
      console.log('\n[DRY RUN] No changes made. Run without --dry-run to apply changes.');
    }
  }
}

// CLI usage
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const rootDir = args.find(arg => !arg.startsWith('--')) || '.';

try {
  const lowercaser = new TypeScriptLowercaser(rootDir, dryRun);
  lowercaser.execute();
} catch (error) {
  console.error('Error:', error instanceof Error ? error.message : error);
  process.exit(1);
}
