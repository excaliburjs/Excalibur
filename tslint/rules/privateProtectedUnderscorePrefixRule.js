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

UnderscorePrefixWalker.prototype.visitMemberFunctionDeclaration = function (node) {
   // get the current position and skip over any leading whitespace
   var propertyName = node.propertyName;
   var variableName = propertyName.text();
   var position = this.getPosition() + TypeScript.leadingTriviaWidth(node);
   var modifiers = node.modifiers.map(function(x){
      return x.text();
   });
   //console.log(modifiers);

   if(variableName[0] !== '_' && (modifiers.indexOf('private') !== -1 || modifiers.indexOf('protected') !== -1)){
      // create a failure at the current position
      this.addFailure(this.createFailure(position, TypeScript.width(node), "'"+variableName + "' private and protected methods must have an '_' prefix"));
   }
   Lint.RuleWalker.prototype.visitMemberFunctionDeclaration.call(this, node);
}
UnderscorePrefixWalker.prototype.visitMemberVariableDeclaration = function (node) {

   var propertyName = node.variableDeclarator.propertyName;
   var variableName = propertyName.text();
   var position = this.getPosition() + TypeScript.leadingTriviaWidth(node);
   //console.log(variableName);

   var modifiers = node.modifiers.map(function(x){
      return x.text();
   });
   //console.log(modifiers);   

   if(variableName[0] !== '_' && (modifiers.indexOf('private') !== -1 || modifiers.indexOf('protected') !== -1)){
      // create a failure at the current position
      this.addFailure(this.createFailure(position, TypeScript.width(node), "'"+variableName + "' private and protected members must have an '_' prefix"));
   }

    // call the base version of this visitor to actually parse this node
    Lint.RuleWalker.prototype.visitMemberVariableDeclaration.call(this, node);
};

exports.Rule = Rule;