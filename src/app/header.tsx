import { APP_TITLE } from "./constants";
import { auth } from "./firebase";

export default function Header() {
  return (
    <div className="w-full text-center flex items-center justify-between">
      <h1 className="text-2xl text-center">{APP_TITLE}</h1>
      <button
        className="bg-slate-500 hover:bg-slate-700 text-white font-bold py-2 px-2 rounded"
        onClick={() => {
          auth.signOut();
        }}
      >
        Sign out
      </button>
    </div>
  );
}
