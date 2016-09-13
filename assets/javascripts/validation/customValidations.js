require('jquery');

module.exports = function () {

  //TODO this nino validator can removed and placed in the html input as attribute pattern="^[A-Za-z]{2}\d{6}[A-Za-z]$"
  jQuery.validator.addMethod('nino', function (value, element) {
    return /^[A-Za-z]{2}\d{6}[A-Za-z]$/.test(value);
  });

  // Check if value of input is correctly contained in suggestion data
  jQuery.validator.addMethod('suggestion', function (value, element) {
    var suggestions = window[element.getAttribute('data-suggestions')];
    var validSuggestion = false;

    $(suggestions).each(function (index, suggestion) {
      if (value.toLowerCase() === suggestion.title.toLowerCase() || value === suggestion.value) {
        validSuggestion = true;
        return false;
      }
    });

    return validSuggestion;
  });

  // Use the pattern attribute on your input with a valid regex
  jQuery.validator.addMethod('pattern', function (value, element, pattern) {
    var dataAttributeFlag = element.getAttribute('data-pattern-flags');
    var flag = dataAttributeFlag || '';
    var regex = new RegExp(pattern, flag);

    return regex.test(value);
  });

  // Validate separate day - month - year fields as valid date
  jQuery.validator.addMethod('dateGroupValid', function(value, element, options) {
    var isValid = false,
        opts = options.split(','),
        params = { group: opts[0], minDate: opts[1], maxDate: opts[2] },
        idPrefix = '#' + params.group + '-',
        $fields = { year: $(idPrefix + 'year'), month: $(idPrefix + 'month'), day: $(idPrefix + 'day') },
        values = { year: parseInt($fields.year.val()), month: parseInt($fields.month.val()) - 1, day: parseInt($fields.day.val()) },
        monthStrings = $fields.month.data('month-strings'),
        monthMapping = $.inArray($fields.month.val().toUpperCase(), monthStrings ? monthStrings.split(',') : []),
        thisMillennium = Math.floor(new Date().getFullYear() / 100) * 100,
        date, maxDate, minDate;

    // All other rules are valid on this element, so empty the error messages
    $('#' + element.id + '-error-message').empty();

    values.month = (isNaN(values.month) && monthMapping > -1) ? monthMapping : values.month;

    // Check date is parse-able, i.e. a real calendar date (e.g. not 30 Feb 2016 or 31 11 2016)
    if (!(isNaN(values.year) || isNaN(values.month) || isNaN(values.day)) && !!(params.maxDate.length && params.minDate.length)) {
      maxDate = new Date(params.maxDate);
      minDate = new Date(params.minDate);

      // If two-digit year entered create a four digit year by assuming century intended
      if (values.year < 100) {
        // A 2 digit year will be interpreted as 19th century by JavaScript date
        if (thisMillennium + values.year <= maxDate.getFullYear()) {
          // ...assume this millennium if year in this millennium lte the maxDateYear
          values.year = thisMillennium + values.year;
        }
        else if (thisMillennium - 100 + values.year >= minDate.getFullYear()) {
          // ...assume last millennium if year in last millennium gte the minDateYear
          values.year = thisMillennium - 100 + values.year;
        }
      }

      // Parse the fields as a Date
      date = new Date(values.year, values.month, values.day);

      // Compare the date fields against the input fields
      isValid = date.getFullYear() === values.year &&
                date.getMonth() === values.month &&
                date.getDate() === values.day &&
                date < maxDate && date > minDate;

      // Show/Hide parse error message
      if (!isValid) {
        $(idPrefix + 'parse-error-message').removeClass('hidden');
      } else {
        $(idPrefix + 'parse-error-message').addClass('hidden');
      }
    }

    return isValid;
  });
};

