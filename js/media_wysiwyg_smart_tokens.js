(function ($) {
    /**
    Override the default enable/disable wysiwyg text editor functionality from
    the media module with custom handlers to be able to support tokens and
    markup for all file types complex markup. **/


  //////////////////////////////////////////////////////////////////////////////
  // ATTACH!
  // ///////////////////////////////////////////////////////////////////////////

  // Only run if plugins is available.
  if (typeof Drupal.wysiwyg == "undefined") {
    return;
  }

  Drupal.wysiwyg.plugins.media.attach = function(content, settings, instanceId) {

    var tagmap = Drupal.settings.tagmap,
        matches = content.match(/\[\[.*?\]\]/g),
        media_definition;

    if (matches) {
      for (var index in matches) {
        var macro = matches[index];

        if (tagmap[macro]) {
          var media_json = macro.replace('[[', '').replace(']]', '');

          // Make sure that the media JSON is valid.
          try {
            media_definition = JSON.parse(media_json);
          }
          catch (err) {
            media_definition = null;
          }
          if (media_definition) {
            // Apply attributes.
            var element = create_element(tagmap[macro], media_definition);
            var markup = outerHTML(element);

            content = content.replace(macro, markup);
          }
        }
        else {
          debug.debug("Could not find content for " + macro);
        }
      }
    }

    return content;
  };


  //////////////////////////////////////////////////////////////////////////////
  // DETACH THE WYSIWYG EDITOR // //////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  Drupal.wysiwyg.plugins.media.detach = function(content, settings, instanceId) {
    ensure_tagmap();
    var tagmap = Drupal.settings.tagmap,
        i = 0,
        markup,
        macro;

    // Replace all media placeholders with their JSON macro representations.
    //
    // There are issues with using jQuery to parse the WYSIWYG content (see
    // http://drupal.org/node/1280758), and parsing HTML with regular
    // expressions is a terrible idea (see http://stackoverflow.com/a/1732454/854985)
    //
    // WYSIWYG editors act wacky with complex placeholder markup anyway, so an
    // image is the most reliable and most usable anyway: images can be moved by
    // dragging and dropping, and can be resized using interactive handles.
    //
    // Media requests a WYSIWYG place holder rendering of the file by passing
    // the wysiwyg => 1 flag in the settings array when calling
    // media_get_file_without_label().

    // var matches = content.match(/<img[^>]+class=[\'"]([^"']+ )?media-element[^>]*>/gi);
    // if (matches) {
    //   for (i = 0; i < matches.length; i++) {
    //     markup = matches[i];
    //     macro = create_macro($(markup));
    //     tagmap[macro] = markup;
    //     content = content.replace(markup, macro);
    //   }
    // }

    // Ok So the above says you can't use regex to parse html without putting
    // the world into some unholy apocalypse. Lets use jquery! Jquery will be
    // our saviour from Tony the Pony.

    $content = $("<div class=\"root\" />").append($(content));

    // Find all nested in html items.
    var matches = $content.find('.media-element');

    // Loop through the nested items
    $.each(matches, function(i, v) {

      var element = $(v);
      macro = create_macro(element);
      tagmap[macro] = v;

      element.replaceWith(macro);

    });

    return outerHTML($content.contents());
  };

//////////////////////////////////////////////////////////////////////////////
// HELPERS // //////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////


/**
 * Ensures the tag map has been initialized.
 */
function ensure_tagmap () {
  Drupal.settings.tagmap = Drupal.settings.tagmap || {};
}


/**
 * Serializes file information as a url-encoded JSON object and stores it as a
 * data attribute on the html element.
 *
 * @param html (string)
 *    A html element to be used to represent the inserted media element.
 * @param info (object)
 *    A object containing the media file information (fid, view_mode, etc).
 */
function create_element (html, info) {
  var element = $(html);

  // Move attributes from the file info array to the placeholder element.
  if (info.attributes) {
    $.each(Drupal.settings.media.wysiwyg_allowed_attributes, function(i, a) {
      if (info.attributes[a]) {
        element.attr(a, info.attributes[a]);
      }
    });
    delete(info.attributes);
  }

  // Important to url-encode the file information as it is being stored in an
  // html data attribute.
  info.type = info.type || "media";
  element.attr('data-file_info', encodeURI(JSON.stringify(info)));

  // Adding media-element class so we can find markup element later.
  var classes = ['media-element'];

  if(info.view_mode){
    classes.push('file-' + info.view_mode.replace(/_/g, '-'));
  }

  element.addClass(classes.join(' '));

  return element;
}

/**
 * Create a macro representation of the inserted media element.
 *
 * @param element (jQuery object)
 *    A media element with attached serialized file info.
 */
function create_macro (element) {
  var file_info = extract_file_info(element);
  if (file_info) {
    return '[[' + JSON.stringify(file_info) + ']]';
  }
  return false;
}

/**
 * Extract the file info from a WYSIWYG placeholder element as JSON.
 *
 * @param element (jQuery object)
 *    A media element with attached serialized file info.
 */
function extract_file_info (element) {
  var file_json = $.data(element, 'file_info') || element.data('file_info'),
      file_info,
      value;

  try {
    file_info = JSON.parse(decodeURIComponent(file_json));
  }
  catch (err) {
    file_info = null;
  }

  if (file_info) {
    file_info.attributes = {};

    // Extract whitelisted attributes.
    $.each(Drupal.settings.media.wysiwyg_allowed_attributes, function(i, a) {

      var attr = element.attr(a);
      if (typeof attr !== null) {
        file_info.attributes[a] = attr;
      }

    });

    delete(file_info.attributes['data-file_info']);
  }

  return file_info;
}

/**
 * Gets the HTML content of an element.
 *
 * @param element (jQuery object)
 */
function outerHTML (element) {
  return $('<div>').append(element.clone()).html();
}



})(jQuery);
