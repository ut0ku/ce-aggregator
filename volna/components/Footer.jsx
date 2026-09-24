export default function Footer({ tk }) {
  return (
    <footer className={`border-t ${tk.border} mt-8`}>
      <div className={`max-w-3xl mx-auto px-4 sm:px-6 py-6 text-xs ${tk.sub}`}>
        <p>Демо-лента обновляется локально и использует заглушечные изображения для карточек.</p>
        <p className="mt-1">Собрано на React и Vite, чтобы быстро проверять структуру, темы и city-aware контент.</p>
      </div>
    </footer>
  );
}