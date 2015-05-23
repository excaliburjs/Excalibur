function Rule() {
    Lint.Rules.AbstractRule.apply(this, arguments);
}

Rule.prototype = Object.create(Lint.Rules.AbstractRule.prototype);
Rule.prototype.apply = function(syntaxTree) {
    return this.applyWithWalker(new UnderscorePrefixWalker(syntaxTree, this.getOptions()));
};

function UnderscorePrefixWalker() {
    Lint.RuleWalker.apply(this, arguments);
}

UnderscorePrefixWalker.prototype = Object.create(Lint.RuleWalker.prototype);
UnderscorePrefixWalker.prototype.visitClassDeclaration = function (node) {
   Lint.RuleWalker.prototype.visitClassDeclaration.call(this, node);
}

UnderscorePrefixWalker.prototype.visitMethodDeclaration = function (node) {
   // get the current position and skip over any leading whitespace
   var propertyName = node.name;
   var variableName = propertyName.text;
   
   var modifiers = [];
   if(node.modifiers){
      modifiers = node.modifiers.map(function(x){
         return x.getText();
      });
   }

   if(variableName[0] !== '_' && (modifiers.indexOf('private') !== -1 || modifiers.indexOf('protected') !== -1)){
      // create a failure at the current position
      this.addFailure(this.createFailure(node.getStart(), node.getWidth(), "'"+variableName + "' private/protected methods need a '_' prefix"));
   }
   Lint.RuleWalker.prototype.visitMethodDeclaration.call(this, node);
}


UnderscorePrefixWalker.prototype.visitPropertyDeclaration = function (node) {

   var propertyName = node.name;   
   var variableName = propertyName.text;
   var position = this.position + node.getLeadingTriviaWidth();
   
   var modifiers = [];
   if(node.modifiers){
      modifiers = node.modifiers.map(function(x){
         return x.getText();
      });
   }

   if(variableName[0] !== '_' && (modifiers.indexOf('private') !== -1 || modifiers.indexOf('protected') !== -1)){
      // create a failure at the current position
      this.addFailure(this.createFailure(node.getStart(), node.getWidth(), "'"+variableName + "' private/protected properties need a '_' prefix"));
   }

    // call the base version of this visitor to actually parse this node
    Lint.RuleWalker.prototype.visitPropertyDeclaration.call(this, node);
};

exports.Rule = Rule;