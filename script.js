document.addEventListener('DOMContentLoaded', function () {
  const guideButtons = document.querySelectorAll('.guide-button');

  guideButtons.forEach(button => {
    button.addEventListener('click', function () {
      const guideId = this.getAttribute('data-guide');
      console.log(`Guide ${guideId} clicked`);
      // You can add functionality to handle clicking the buttons here.
    });
  });
});
