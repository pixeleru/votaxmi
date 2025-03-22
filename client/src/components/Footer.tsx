const Footer = () => {
  return (
    <footer className="bg-primary text-white py-4 mt-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-lg font-bold font-sans">School Queen Voting System</h2>
            <p className="text-sm opacity-80">© 2023 School Name. All rights reserved.</p>
          </div>
          <div>
            <p className="text-sm opacity-80">
              Contact: <a href="mailto:admin@school.edu" className="underline">admin@school.edu</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
