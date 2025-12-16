export default function AuroraBackground () {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="box1 absolute top-0 left-0 w-[500px] h-[500px] rounded-full opacity-40 blur-[100px] -translate-x-1/2 -translate-y-1/2 mix-blend-multiply bg-[#00d5ff]/20" />
      <div className="box2 absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full opacity-40 blur-[100px] translate-x-1/3 translate-y-1/3 mix-blend-multiply bg-[#007bff]" />
    </div>
  );
};

