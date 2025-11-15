import { Modal, GroupInfo, GroupForm, SearchingRooms, AddMembers, Alert } from '@/components/index';
import { useChatStore } from '@/store/useChatStore';
import { useMemo } from 'react';

const ModalManager = () => {
    const { modal, openModal } = useChatStore();

    // Always define the modals map first
    const modals = useMemo(() => ({
        Alert: { component: Alert, title: modal?.props?.title },
        GroupInfo: { component: GroupInfo, title: '', isWithClass: true },
        GroupCreate: { component: GroupForm, title: modal?.props?.title },
        GroupEdit: { component: GroupForm, title: modal?.props?.title },
        AddMembers: { component: AddMembers, title: '', isWithClass: true },
        SearchingRooms: { component: SearchingRooms, title: modal?.props?.title },
    }), [modal]);

    // If no modal type, just render nothing
    if (!modal?.type) return null;

    const { component: Component, title, isWithClass } = modals[modal.type];

    return (
        <Modal
            title={title}
            isOpen={!!modal?.type}
            onClose={() => openModal(null)}
            size={modal?.props?.size}
            className={isWithClass ? "!bg-transparent !shadow-none" : ""}
        >
            <Component {...modal.props} />
        </Modal>
    );
}

export default ModalManager;
