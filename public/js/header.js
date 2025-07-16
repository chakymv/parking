document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebar');
  const submenus = document.querySelectorAll('.sidebar .submenu > a');
  
  // Expandir/contraer sidebar al pasar el ratón
  if (sidebar) {
    sidebar.addEventListener('mouseenter', () => {
      sidebar.classList.add('expanded');
    });
    
    sidebar.addEventListener('mouseleave', () => {
      sidebar.classList.remove('expanded');
    });
  }

  // Función para abrir/cerrar submenús
  const toggleSubmenu = (e) => {
    e.preventDefault(); // Prevenir la navegación del enlace '#'
    const submenuItem = e.currentTarget.parentElement;
    submenuItem.classList.toggle('open');
  };

  // Eventos en los enlaces de submenú
  submenus.forEach(submenu => {
    submenu.addEventListener('click', toggleSubmenu);
  });
});