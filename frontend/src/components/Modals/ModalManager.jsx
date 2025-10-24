import { useCallback } from "react";
import { Modal, GroupInfo, GroupForm, SendRequest } from "../index";

const ModalManager = ({ modalType, setModalType }) => {

    const titles =
    {
        GroupCreate: "ایجاد گروه جدید",
        groupEdit: "ادیت گروه",
        sendRequest: "جستجوی مخاطب  "
    }

    const renderModal = useCallback(() => {
        switch (modalType) {
            case "groupInfo":
                return <GroupInfo />;

            case "groupEdit":
                return <GroupForm state="edit" />;

            case "GroupCreate":
                return <GroupForm state="create" />

            case "sendRequest":
                return <SendRequest />

            default:
                return null;
        }
    })
    return (
        <Modal
            title={titles[modalType]}
            isOpen={!!modalType}
            onClose={() => setModalType(null)}
            className={modalType === "groupInfo" && "!bg-transparent !shadow-none"}
        >
            {renderModal()}
        </Modal>
    )
}

export default ModalManager