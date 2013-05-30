/**
 * @file
 *
 * @Todo: Reduce redundant code. Ungh bad. -Shea.
 */

CKEDITOR.config.autoParagraph = false;

CKEDITOR.plugins.add( 'media_placeholder', {
  init: function( editor )
  {

    // SELECT CHANGE ///////////////////////////////////////////////////////////

    editor.on('selectionChange', function(evt) {
      var sel = editor.getSelection();
      var element = sel.getStartElement();
      var jelement = jQuery(element.$);
      var actElement = null;
      var medias = jQuery(editor.document.$).find('.media-element');

      medias.css('background', 'transparent');

      if(jelement.hasClass('media-element')) {
        actElement = jelement;
      }

      // If the selected element has a parent media element. eg: we clicked into
      // a nested field. Then we need to get the parent wrapper element and
      // highlight it.

      var parentMedia = jelement.parents('.media-element');
      if (parentMedia.length) {
        actElement = parentMedia.eq(0);
      }

      if (actElement === null) {
        destroySpaceMedia(jQuery(editor.document.$));
        return;
      }

      actElement.css({background:"#DDDDFF"});

      if (actElement.find('.leftspacer').length < 1) {
        destroySpaceMedia(jQuery(editor.document.$));
        addSpaceMedia(actElement, jQuery(editor.document.$));
      }

    });

    // INSTANCE READY //////////////////////////////////////////////////////////

    editor.on('instanceReady', function(evt) {

      var medias = jQuery(editor.document.$).find('.media-element');
      medias.css('background', 'transparent');

      jQuery.each(medias, function (i, mediaelement) {

        var parent = new CKEDITOR.dom.element(mediaelement);
        parent.unselectable();

        var children = mediaelement.children;

        for (j = 0; j < children.length; j++){
          var child = children[j];
          child.setAttribute('contenteditable', 'false');
          var element = new CKEDITOR.dom.element(child);
          element.unselectable();
        }

      });

      // var arr = editor.document.$.getElementsByTagName("div");
      // for (i = 0; i < arr.length; i++) {
      //    var cl = arr[i].getAttribute('class');
      //    if (cl.match(/media-element/ig)) {

      //     // Parent.
      //     arr[i].setAttribute('contenteditable', 'false');
      //     var parent = new CKEDITOR.dom.element(arr[i]);
      //     parent.unselectable();

      //     // Children Items.
      //     var children = arr[i].children;

      //     for (j = 0; j < children.length; j++){
      //       var child = children[j];
      //       child.setAttribute('contenteditable', 'false');
      //       var element = new CKEDITOR.dom.element(child);
      //       element.unselectable();
      //     }

      //   }
      // }

    editor.updateElement();

    });

    // ON BLUR /////////////////////////////////////////////////////////////////

    // Remove backgrounds when not on focus.
    editor.on('blur', function(evt) {
      try {
        var medias = jQuery(evt.editor.document.$).find('.media-element');
        medias.css('background', 'transparent');
        destroySpaceMedia(jQuery(evt.editor.document.$));
        editor.updateElement();
      } catch(err) {
        // editor must be disabled. Thats fine.
      }
    });

    // BEFORE SAVE /////////////////////////////////////////////////////////////

    // Remove backgrounds from undo snapshots.
    editor.on('saveSnapshot', function(evt) {
      var medias = jQuery(editor.document.$).find('.media-element');
      medias.css('background', 'transparent');
      editor.updateElement();
    });

    // Remove backgrounds before unloading.
    editor.on('beforeModeUnload', function(evt) {
      if(editor.document) {
        var medias = jQuery(editor.document.$).find('.media-element');
        medias.css('background', 'transparent');
        destroySpaceMedia(jQuery(evt.editor.document.$));
        editor.updateElement();
      }
    });

    // Remove all backgrounds when the form is submitted.
    jQuery('.node-form .form-submit').click(function() {
      jQuery.each(CKEDITOR.instances, function (i, v) {
        var editor = v;
        var medias = jQuery(editor.document.$).find('.media-element');
        destroySpaceMedia(jQuery(evt.editor.document.$));
        medias.css('background', 'transparent');
      });
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

        if (jQuery(element.$.parentElement).hasClass('media-element')) {
          action_element = jQuery(element.$.parentElement);
        }

        if (action_element) {
          action_element.css({float:'left',padding:'5px'});
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

        if (jQuery(element.$.parentElement).hasClass('media-element')) {
          action_element = jQuery(element.$.parentElement);
        }

        if (action_element) {
          action_element.css({float:'right',padding:'5px'});
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

        if (jQuery(element.$.parentElement).hasClass('media-element')) {
          action_element = jQuery(element.$.parentElement);
        }

        if (action_element) {
          action_element.attr('style', '');
        }

      }
    });


  }
});

/**
 * Adds a space toggler button to an element.
 * @param  {[type]} element    [description]
 * @param  {[type]} direction
 * @return {[type]}            [description]
 */
var addSpaceMedia = function(element, dom) {

    var myElement = element;

    // Don't add mulitples.
    if (myElement.find('.leftspacer').length) {
      return;
    }

    myElement.undelegate('.leftspacer', 'click');
    myElement.undelegate('.rightspacer', 'click');

    myElement.delegate('.leftspacer', {
      'click' : function(evt) {
        var parent = jQuery(this).parents('.media-element');
        parent.before('&nbsp;');
      }
    });

    myElement.delegate('.rightspacer', {
      'click' : function(evt) {
        var parent = jQuery(this).parents('.media-element');
        parent.after('&nbsp;');
      }
    });

    myElement.append("<span class=\"leftspacer\" contenteditable=\"false\">Click Left</span>");
    myElement.append("<span class=\"rightspacer\" contenteditable=\"false\">Click right</span>");
};

/**
 * Adds a space toggler button to an element.
 * @param  {[type]} element    [description]
 * @param  {[type]} direction
 * @return {[type]}            [description]
 */
var destroySpaceMedia = function(dom) {
  var elements = dom.find('.leftspacer, .rightspacer');
  elements.remove();
};

