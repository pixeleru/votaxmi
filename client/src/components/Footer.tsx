const Footer = () => {
  return (
    <footer className="bg-primary text-white py-4 mt-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-lg font-bold font-sans">Complejo Educativo Concha Viuda de Escalón</h2>
            <p className="text-sm opacity-80">© 2025</p>
          </div>
          <div>
            <p className="text-sm opacity-80">
              <img className="size-16 w-auto" src="https://cdn.discordapp.com/attachments/1352908146984616006/1352908182552317992/ugu.webp?ex=67dfb96e&is=67de67ee&hm=1af82f6d7dd285e0ad509baf2843cdf59d7848fc55cb0e2d076fb0135e0bc265&"></img>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
