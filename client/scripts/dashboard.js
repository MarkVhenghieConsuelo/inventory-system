const links = document.querySelectorAll('.sidebar a');
links.forEach(link => {
  link.addEventListener('click', () => {
    links.forEach(link => link.classList.remove('active'));
    link.classList.add('active');
  });
});