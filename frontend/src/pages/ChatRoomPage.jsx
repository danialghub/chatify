// pages/ChatRoomPage.tsx
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRoomStore } from '@/store/useRoomStore';
import ChatContainer from '@/components/ChatContainer';
import { useQueryClient } from '@tanstack/react-query';

export default function ChatRoomPage() {
    const { roomId } = useParams ();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const {
        selectedRoom,
        setSelectedRoom,
        rooms,
        fetchRoomById
    } = useRoomStore();

    // Load room data when roomId changes
    useEffect(() => {
        if (!roomId) {
            navigate('/');
            return;
        }

        // Check if room exists in store
        const existingRoom = rooms.find(r => r._id === roomId);

        if (existingRoom) {
            setSelectedRoom(existingRoom);
        } else {
            // Fetch room by ID if not in store
            fetchRoomById(roomId).catch((error) => {
                console.error('Room not found:', error);
                navigate('/'); // Redirect to home
            });
        }
    }, [roomId, rooms, setSelectedRoom, fetchRoomById, navigate]);

    // Clear selected room on unmount
    useEffect(() => {
        return () => {
            setSelectedRoom(null);
            // Optionally clear messages cache
            if (roomId) {
                queryClient.removeQueries({ queryKey: ['messages', roomId] });
            }
        };
    }, [roomId, setSelectedRoom, queryClient]);

    // Loading state
    if (!selectedRoom || selectedRoom._id !== roomId) {
        return (
            <div className="flex-1 flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-500">در حال بارگذاری...</p>
                </div>
            </div>
        );
    }

    return <ChatContainer />;
}