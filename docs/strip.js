module.exports = {
    strip: function(item) {
         var rex = /<\/?.*?>/g;
         return item.replace(rex, "").replace('\n','').replace('\r','');
    },
    isNotPrivate: function(item){
      var access = item.access || "";
      if(!(access.toLowerCase().indexOf('private') > -1)){
         return JSON.stringify(item) + "<br/>";
      }else{
         return null;
      }
    },
    ifNotPrivate: function(access, options) {
      access = access || "";
      if(!(access.toLowerCase().indexOf('private') > -1)){
         return options.fn(this);
      }else{
         return options.inverse(this);
      }
    }      
};