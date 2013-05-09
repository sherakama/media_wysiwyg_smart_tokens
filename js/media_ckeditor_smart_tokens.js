(function ($) {
    /**
    Override the default enable/disable ckeditor text editor functionality from
    the ckeditor module with custom handlers to be able to support tokens and
    markup for all file types complex markup. **/


  //////////////////////////////////////////////////////////////////////////////
  // ATTACH!
  // ///////////////////////////////////////////////////////////////////////////

  Drupal.media = Drupal.media || {};

  Drupal.settings.media.wysiwyg_allowed_attributes = ["height", "width", "hspace", "vspace", "border", "align", "style", "alt", "title", "class", "id"];

  // Only run if plugins is available.
  if (typeof Drupal.settings.ckeditor.plugins['media'] == "undefined") {
    return;
  }

  Drupal.settings.ckeditor.plugins['media'].attach = function(content) {

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

  Drupal.settings.ckeditor.plugins['media'].detach = function(content) {

    ensure_tagmap();
    var tagmap = Drupal.settings.tagmap,
        i = 0,
        markup,
        macro;

    // $content = $("<div class=\"root\" />").append($(content));
    $content = $("<div class=\"root\">" + content + "</div>");

    // Find all nested in html items.
    var matches = $content.find('.media-element');

    // Loop through the nested items.
    $.each(matches, function(i, v) {

      var element = $(v);
      macro = create_macro(element);
      tagmap[macro] = v;

      element.replaceWith(macro);

    });

    return outerHTML($content.contents());

  };

  //////////////////////////////////////////////////////////////////////////////
  // INSERT // //////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  Drupal.settings.ckeditor.plugins['media'].insertMediaFile = function(mediaFile, viewMode, formattedMedia, options, ckeditorInstance) {
    toInsert = formattedMedia;
    ckeditorInstance.insertHtml(toInsert);
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

  $attr = element[0].attributes;

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
      file_info.attributes[a] = element.attr(a);
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
