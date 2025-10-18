import { useEffect } from "react"
import { useAuthStore } from "../store/useAuthStore";

import { UsersLoadingSkeleton, NoChatsFound ,ChatIcon} from './index'
import { useRoomtStore } from "../store/useRoomStore";

const ContactList = () => {
  const { allGroupChat, getAllGroups, isRoomsLoading, selectedRoom, setSelectedRoom } = useRoomtStore()
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getAllGroups();
  }, [getAllGroups]);

  if (isRoomsLoading) return <UsersLoadingSkeleton />;
  if (allGroupChat.length === 0)
    return <NoChatsFound title="هیچ گروهی وجود ندارد" type="گروه" />;
  return (
    <>
      {allGroupChat.map((group) => (
        <div
          key={group._id}
          className={`${selectedRoom?._id === group._id ? "bg-cyan-500/30" : "bg-cyan-500/5"} py-2 px-4 rounded-lg cursor-pointer hover:bg-cyan-500/30 transition-color`}
          onClick={() => setSelectedRoom(group)}
        >

          <div className="flex items-center gap-3">
          
              <div className="relative size-12 rounded-full bg-indigo-100 text-indigo-500 flex items-center justify-center">
                
                <ChatIcon 
                profile=''
                name={group.name}
                classProps='size-12 '
                />
             
              </div>
           
            <h4 className="text-slate-200 font-medium">{group.name}</h4>
          </div>


        </div>
      ))}
    </>
  );
}
export default ContactList;
