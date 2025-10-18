import { useChatStore } from "../store/useChatStore";

const ActiveTabSwitch = () => {
  const { activeTab, setActiveTab } = useChatStore();

  return (
    <div className="tabs tabs-boxed bg-transparent p-2 m-2">
      <button
        onClick={() => setActiveTab("chats")}
        className={`tab ${activeTab === "chats" ? "bg-cyan-500/20 text-cyan-400" : "text-slate-400"
          }`}
      >
        چت ها
      </button>

      <button
        onClick={() => setActiveTab("groups")}
        className={`tab ${activeTab === "groups" ? "bg-cyan-500/20 text-cyan-400" : "text-slate-400 "
          }`}
      >
        گروه ها
      </button>
    </div>
  );
}
export default ActiveTabSwitch;
