import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

import { UsersLoadingSkeleton } from './index'

const ContactList = () => {
  const { getAllContacts, allContacts, setSelectedUser, isUsersLoading, selectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getAllContacts();
  }, [getAllContacts]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;

  return (
    <>
      {allContacts.map((contact) => (
        <div
          key={contact._id}
          className={`${selectedUser?._id === contact._id ? "bg-cyan-500/30" : "bg-cyan-500/5"} py-2 px-4 rounded-lg cursor-pointer hover:bg-cyan-500/30 transition-color`}
          onClick={() => setSelectedUser(contact)}
        >
          
          <div className="flex items-center gap-3">
            <div className={`avatar ${onlineUsers.includes(contact._id) ? "online" : "offline"}`}>
              <div className="size-12 rounded-full">
                <img src={contact.profilePic || "/avatar.png"} />
              </div>
            </div>
            <h4 className="text-slate-200 font-medium">{contact.name}</h4>
          </div>
         
          
        </div>
      ))}
    </>
  );
}
export default ContactList;
