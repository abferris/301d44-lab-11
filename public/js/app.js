'use strict';

$('.hide').click( function(){
  event.preventDefault();
  $(this).nextAll('.toggle').toggle();
  // $(this).next('.hidden').toggle();
});
