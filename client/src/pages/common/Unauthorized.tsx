const Unauthorized = () => {
  return (
    <main className="min-h-[60vh] flex items-center justify-center">
      <section className="text-center">
        <h1 className="text-2xl font-semibold mb-2">Access Denied</h1>
        <p className="text-gray-600">You do not have permission to view this page.</p>
      </section>
    </main>
  );
};

export default Unauthorized;
