CKEDITOR.plugins.add( 'media_placeholder', {
  init: function( editor )
  {

    editor.on('selectionChange', function(evt) {
      // var sel = editor.getSelection();
      // var element = sel.getStartElement();

      // var parentClasses = element.$.parentElement.attributes.class;
      // if (parentClasses.value.match(/element/gi)) {
      //   // move image attributes to the parent tag.

      //   element.$.isEditable(true);
      //   element.$.removeAttribute('contenteditable');
      //   // element.$.parentElement.setStyle('float', 'right');

      // }

    });

    editor.on('instanceReady', function(evt) {

      var arr = editor.document.$.getElementsByTagName("div");
      for (i = 0; i < arr.length; i++) {
         var cl = arr[i].getAttribute('class');
         if (cl.match(/media-element/ig)) {

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


    // BUTTONS /////////////////////////////////////////////////////////////////

    editor.ui.addButton( 'media_element_left', {
      label: 'Media Left',
      command: 'media_element_left_cmd',
      icon: this.path + 'images/media-left.png'
      }
    );

    editor.ui.addButton( 'media_element_right', {
      label: 'Media Right',
      command: 'media_element_right_cmd',
      icon: this.path + 'images/media-right.png'
      }
    );

    editor.ui.addButton( 'media_element_inline', {
      label: 'Media Inline',
      command: 'media_element_inline_cmd',
      icon: this.path + 'images/media-inline.png'
      }
    );

    // COMMANDS ////////////////////////////////////////////////////////////////

    editor.addCommand( 'media_element_left_cmd', {
      exec : function(editor) {

        var sel = editor.getSelection();
        var element = sel.getStartElement();
        var action_element = null;

        if (jQuery(element.$).hasClass('media-element')) {
          action_element = jQuery(element.$);
        }

        var parentClasses = element.$.parentElement.attributes.class;
        if (parentClasses.value.match(/media\-element/gi)) {
          action_element = jQuery(element.$.parentElement);
        }

        if (action_element) {
          action_element.css('float', 'left');
        }

      }
    });

    editor.addCommand( 'media_element_right_cmd', {
      exec : function(editor) {

        var sel = editor.getSelection();
        var element = sel.getStartElement();
        var action_element = null;

        if (jQuery(element.$).hasClass('media-element')) {
          action_element = jQuery(element.$);
        }

        var parentClasses = element.$.parentElement.attributes.class;
        if (parentClasses.value.match(/media\-element/gi)) {
          action_element = jQuery(element.$.parentElement);
        }

        if (action_element) {
          action_element.css('float', 'right');
        }

      }
    });

    editor.addCommand( 'media_element_inline_cmd', {
      exec : function(editor) {

        var sel = editor.getSelection();
        var element = sel.getStartElement();
        var action_element = null;

        if (jQuery(element.$).hasClass('media-element')) {
          action_element = jQuery(element.$);
        }

        var parentClasses = element.$.parentElement.attributes.class;
        if (parentClasses.value.match(/media\-element/gi)) {
          action_element = jQuery(element.$.parentElement);
        }

        if (action_element) {
          action_element.attr('style', '');
        }

      }
    });


  }
});
