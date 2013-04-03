

CKEDITOR.plugins.add( 'media_placeholder', {
  init: function( editor )
  {

    // editor.on('key', function(evt) {
    //   var sel = editor.getSelection();
    //   var element = sel.getStartElement();
    //   console.log(element);
    //   if (element.hasClass('field') || element.hasClass('field-item')) {
    //     var parents = element.getParents();
    //     console.log(parents);
    //   }
    // });

    editor.on('instanceReady', function(evt) {

      var arr = editor.document.$.getElementsByTagName("div");
      for (i = 0; i < arr.length; i++) {
         var cl = arr[i].getAttribute('class');
         if (cl.match(/media-element/ig)) {

          // var element = new CKEDITOR.dom.element(arr[i]);
          // element.unselectable();
          // var childs = element.getChildren();

          // for (j = 0; j < childs.$.length; j++){
          //   var child = childs[j];
          //   // child.removeAttributes();
          //   // child.setStyle('float', 'right');
          //   console.log(childs);
          // }

          // arr[i].setAttribute('contenteditable', 'false');

          var children = arr[i].children;

          for (j = 0; j < children.length; j++){
            var child = children[j];
            child.setAttribute('contenteditable', 'false');
            var element = new CKEDITOR.dom.element(child);
            element.unselectable();
          }

         }
      }

    editor.updateElement();

    });

  }
});
