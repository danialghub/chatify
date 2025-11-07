import { useCallback } from "react";
import { Modal, GroupInfo, GroupForm, SearchingRooms, AddMembers } from '@/components/index';

const ModalManager = ({ modalType, setModalType }) => {

    const titles =
    {
        GroupCreate: "ایجاد گروه جدید",
        groupEdit: "ادیت گروه",
        SearchingRooms: "جستجوی مخاطب "
    }

    const renderModal = useCallback(() => {
        switch (modalType) {
            case "groupInfo":
                return <GroupInfo />;

            case "groupEdit":
                return <GroupForm state="edit" />;

            case "GroupCreate":
                return <GroupForm state="create" />

            case "AddMembers":
                return <AddMembers />

            case "SearchingRooms":
                return <SearchingRooms />

            default:
                return null;
        }
    }, [modalType])
    
    return (
        <Modal
            title={titles[modalType]}
            isOpen={!!modalType}
            onClose={() => setModalType(null)}
            className={(modalType === "groupInfo" || modalType === "AddMembers") && "!bg-transparent !shadow-none"}
        >
            {renderModal()}
        </Modal>
    )
}

export default ModalManager