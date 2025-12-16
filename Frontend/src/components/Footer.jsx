export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-10 pb-8">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h4 className="font-semibold mb-3 text-white">More About Company</h4>
          <p className="text-sm text-slate-400">
            CleanStreet helps residents report local problems quickly and track fixes as they
            happen.
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-white">Keep Connected</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>Like us on Facebook</li>
            <li>Follow us on Twitter</li>
            <li>Follow us on Instagram</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-white">Contact</h4>
          <p className="text-sm text-slate-400">
            clean street HQ
            <br />
            New Delhi - 110001
            <br />
            contact@cleanstreetofficial.com
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-8 text-slate-500 text-sm">
        <hr className="border-slate-700/40 mb-4" />
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>© {new Date().getFullYear()} CleanStreet.</div>
          <div className="space-x-4">
            <a href="#" className="text-slate-400 hover:text-white">
              Company
            </a>
            <a href="#" className="text-slate-400 hover:text-white">
              Privacy
            </a>
            <a href="#" className="text-slate-400 hover:text-white">
              Terms
            </a>
          </div>
        </div>
      </div>
      <div>
        <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl xl:text-[180px] text-center text-white/20 font-[Inter] tracking-tighter font-black italic">
          CLEAN STREET
        </h1>
      </div>
    </footer>
  );
}
