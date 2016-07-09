// client-side js
// run by the browser each time your view template is loaded

// by default, you've got jQuery,
// add other scripts at the bottom of index.html

$(function() {
  console.log('hello world :o');
  
  function refreshBeerCount() {
    $.get('/beerCount', function(searchResult) {
      console.log(JSON.stringify(searchResult));
      $('#beerCount').text(searchResult.count);
    });
  }
  
  $(refreshBeerCount);
  
  $.get('/backendStatus', function(status) {
    $('#backendStatus').text(status);
  });
  
  $('#importBeers').submit(function(e) {
    e.preventDefault();
     $.post('/importBeers', $('#importBeers').serialize(), function(response) {
        refreshBeerCount(); 
      },
      'json'
    );
  });
});
