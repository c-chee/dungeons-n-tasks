'use client';
import { useState } from 'react';
import Card from './Card';
import BubbleButton from '@/components/ui/BubbleButton';
import Modal from '../ui/Modal';
import IconButton from '../ui/IconButton';

const WarningIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const MessageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

export default function CurrentMissionsCard({ quests, onUpdateStatus, onSubmitComplete }) {
  const [blockReason, setBlockReason] = useState('');
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [currentBlockQuest, setCurrentBlockQuest] = useState(null);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [currentRevisionQuest, setCurrentRevisionQuest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentQuest, setCurrentQuest] = useState(null);
  const [expandedNotes, setExpandedNotes] = useState({});

  const toggleExpand = (questId) => {
    setExpandedNotes(prev => ({
      ...prev,
      [questId]: !prev[questId]
    }));
  };

  const openBlockModal = (quest) => {
    setCurrentBlockQuest(quest);
    setBlockReason('');
    setShowBlockModal(true);
  };

  const handleBlockSubmit = () => {
    if (!blockReason.trim()) return;
    if (currentBlockQuest && onUpdateStatus) {
      onUpdateStatus(currentBlockQuest.id, 'blocked', blockReason);
    }
    setShowBlockModal(false);
    setCurrentBlockQuest(null);
    setBlockReason('');
  };

  const openRevisionNotesModal = (quest) => {
    setCurrentRevisionQuest(quest);
    setShowRevisionModal(true);
  };

  const openDetailModal = (quest) => {
    setCurrentQuest(quest);
    setShowDetailModal(true);
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'assigned':
        return {
          bg: 'var(--status-available-bg)',
          text: 'var(--status-available)',
          label: 'Assigned'
        };
      case 'in_progress':
        return {
          bg: 'var(--status-in-progress-bg)',
          text: 'var(--status-in-progress)',
          label: 'In Progress'
        };
      case 'blocked':
        return {
          bg: 'var(--status-blocked-bg)',
          text: 'var(--status-blocked)',
          label: 'Blocked'
        };
      case 'pending_review':
        return {
          bg: 'var(--status-pending-review-bg)',
          text: 'var(--status-pending-review)',
          label: 'Pending Review'
        };
      case 'completed':
        return {
          bg: 'var(--status-completed-bg)',
          text: 'var(--status-completed)',
          label: 'Completed'
        };
      default:
        return {
          bg: '#f3f4f6',
          text: '#6b7280',
          label: status
        };
    }
  };

  const activeQuests = quests.filter(q => q.status !== 'completed');
  const completedQuests = quests.filter(q => q.status === 'completed');

  const renderQuestCard = (quest) => {
    const MAX_DESC = 80;
    const isLong = quest.description && quest.description.length > MAX_DESC;
    const displayDesc = isLong && !expandedNotes[quest.id]
      ? quest.description.substring(0, MAX_DESC) + '...'
      : quest.description;
    
    const statusStyle = getStatusStyles(quest.status);
    const isCompleted = quest.status === 'completed';

    return (
      <div 
        key={quest.id} 
        className={`border p-3 rounded cursor-pointer transition-all hover:shadow-md ${
          isCompleted ? 'bg-gray-50 opacity-75' : 'bg-white/50 hover:bg-gray-50'
        }`}
        onClick={() => openDetailModal(quest)}
      >
        <div className='flex justify-between items-start'>
          <div className='flex-1'>
            <div className='flex items-center gap-2 mb-1'>
              <p className={`font-semibold ${isCompleted ? 'line-through text-gray-500' : ''}`}>
                {quest.title}
              </p>
              <span 
                className='text-xs px-2 py-0.5 rounded font-medium'
                style={{ 
                  backgroundColor: statusStyle.bg, 
                  color: statusStyle.text 
                }}
              >
                {statusStyle.label}
              </span>
            </div>
            
            {quest.guild_name && (
              <p className='text-xs text-gray-500 mb-1'>
                Assigned by: {quest.guild_name}
              </p>
            )}
            
            <p className='text-sm text-gray-600'>{displayDesc}</p>
            {isLong && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(quest.id);
                }}
                className='text-xs text-blue-500 hover:text-blue-700'
              >
                {expandedNotes[quest.id] ? 'Show less' : 'Show more'}
              </button>
            )}
            
            <div className='flex items-center gap-1 mt-1'>
              <span className='text-xs text-gray-600'>
                Reward: {quest.reward_coins} coins • {quest.reward_xp} XP
              </span>
              
              {quest.block_reason && (
                <IconButton 
                  icon={<WarningIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    openBlockModal(quest);
                  }}
                  title='View Block Reason'
                  color='red'
                  size='sm'
                />
              )}
              
              {quest.revision_note && (
                <IconButton 
                  icon={<MessageIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    openRevisionNotesModal(quest);
                  }}
                  title='View Feedback'
                  color='orange'
                  size='sm'
                />
              )}
            </div>
          </div>
          
          {!isCompleted && (
            <div className='flex flex-col gap-1 ml-2' onClick={(e) => e.stopPropagation()}>
              {quest.status === 'assigned' && (
                <BubbleButton 
                  onClick={() => onUpdateStatus && onUpdateStatus(quest.id, 'in_progress')}
                  className='bg-blue-500 hover:bg-blue-600 text-white text-xs'
                >
                  Start
                </BubbleButton>
              )}
              
              {quest.status === 'in_progress' && (
                <>
                  <BubbleButton 
                    onClick={() => openBlockModal(quest)}
                    className='bg-red-400 hover:bg-red-500 text-white text-xs'
                  >
                    Block
                  </BubbleButton>
                  <BubbleButton 
                    onClick={() => onSubmitComplete && onSubmitComplete(quest.id)}
                    className='bg-green-500 hover:bg-green-600 text-white text-xs'
                  >
                    Submit
                  </BubbleButton>
                </>
              )}
              
              {quest.status === 'blocked' && (
                <BubbleButton 
                  onClick={() => onUpdateStatus && onUpdateStatus(quest.id, 'in_progress')}
                  className='bg-yellow-500 hover:bg-yellow-600 text-white text-xs'
                >
                  Resume
                </BubbleButton>
              )}
              
              {quest.status === 'pending_review' && (
                <BubbleButton 
                  disabled
                  className='bg-gray-300 text-gray-500 text-xs cursor-not-allowed'
                >
                  Awaiting
                </BubbleButton>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!quests || quests.length === 0) {
    return (
      <Card variant='default'>
        <h2 className='font-bold text-lg'>Current Missions</h2>
        <p className='text-sm text-gray-500 mt-2'>You have no active missions.</p>
      </Card>
    );
  }

  return (
    <Card variant='default'>
      <h2 className='font-bold text-lg'>Current Missions</h2>
      
      <div className='flex flex-col gap-3 mt-2'>
        {activeQuests.map(quest => renderQuestCard(quest))}
      </div>

      {completedQuests.length > 0 && (
        <div className='mt-6'>
          <h4 className='text-sm font-semibold text-gray-500 mb-2'>Completed</h4>
          <div className='flex flex-col gap-2'>
            {completedQuests.map(quest => renderQuestCard(quest))}
          </div>
        </div>
      )}

      {/* Block Modal */}
      <Modal isOpen={showBlockModal} onClose={() => setShowBlockModal(false)}>
        <h2 className='font-bold text-lg mb-4'>Why are you blocked?</h2>
        <textarea
          placeholder='Enter reason for blocking...'
          value={blockReason}
          onChange={(e) => setBlockReason(e.target.value)}
          className='w-full border p-2 rounded min-h-[100px]'
        />
        <div className='flex gap-2 mt-4'>
          <BubbleButton 
            onClick={handleBlockSubmit}
            disabled={!blockReason.trim()}
            className='bg-red-500 hover:bg-red-600 text-white'
          >
            Submit Block
          </BubbleButton>
          <BubbleButton onClick={() => setShowBlockModal(false)}>
            Cancel
          </BubbleButton>
        </div>
      </Modal>

      {/* Block Reason View Modal */}
      <Modal isOpen={showBlockModal && currentBlockQuest?.block_reason} onClose={() => {
        setShowBlockModal(false);
        setCurrentBlockQuest(null);
      }}>
        <h2 className='font-bold text-lg mb-4 text-red-600'>Block Reason</h2>
        {currentBlockQuest?.block_reason && (
          <div className='p-3 bg-red-50 rounded'>
            <p className='text-gray-700'>{currentBlockQuest.block_reason}</p>
          </div>
        )}
        <BubbleButton onClick={() => {
          setShowBlockModal(false);
          setCurrentBlockQuest(null);
        }} className='mt-4'>
          Close
        </BubbleButton>
      </Modal>

      {/* Revision Notes Modal */}
      <Modal isOpen={showRevisionModal} onClose={() => setShowRevisionModal(false)}>
        <h2 className='font-bold text-lg mb-4 text-orange-600'>Guild Master Feedback</h2>
        {currentRevisionQuest?.revision_note && (
          <div className='p-3 bg-orange-50 rounded'>
            <p className='text-gray-700'>{currentRevisionQuest.revision_note}</p>
          </div>
        )}
        <BubbleButton onClick={() => setShowRevisionModal(false)} className='mt-4'>
          Close
        </BubbleButton>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)}>
        {currentQuest && (
          <>
            <h2 className='font-bold text-lg mb-4'>{currentQuest.title}</h2>
            
            <div className='mb-4'>
              <p className='text-sm font-medium text-gray-500'>Status</p>
              <span 
                className='inline-block mt-1 px-2 py-1 rounded text-xs font-medium'
                style={{ 
                  backgroundColor: getStatusStyles(currentQuest.status).bg, 
                  color: getStatusStyles(currentQuest.status).text 
                }}
              >
                {getStatusStyles(currentQuest.status).label}
              </span>
            </div>
            
            {currentQuest.guild_name && (
              <div className='mb-4'>
                <p className='text-sm font-medium text-gray-500'>Assigned by</p>
                <p className='text-gray-700'>{currentQuest.guild_name}</p>
              </div>
            )}
            
            <div className='mb-4'>
              <p className='text-sm font-medium text-gray-500'>Description</p>
              <p className='text-gray-700'>{currentQuest.description || 'No description'}</p>
            </div>
            
            <div className='mb-4'>
              <p className='text-sm font-medium text-gray-500'>Rewards</p>
              <p className='text-gray-700'>{currentQuest.reward_coins} coins • {currentQuest.reward_xp} XP</p>
            </div>
            
            {currentQuest.block_reason && (
              <div className='mb-4 p-3 bg-red-50 rounded'>
                <p className='text-sm font-medium text-red-700'>Block Reason</p>
                <p className='text-gray-700 mt-1'>{currentQuest.block_reason}</p>
              </div>
            )}
            
            {currentQuest.revision_note && (
              <div className='mb-4 p-3 bg-orange-50 rounded'>
                <p className='text-sm font-medium text-orange-700'>Guild Master Feedback</p>
                <p className='text-gray-700 mt-1'>{currentQuest.revision_note}</p>
              </div>
            )}
            
            <div className='mt-4'>
              <BubbleButton onClick={() => setShowDetailModal(false)}>
                Close
              </BubbleButton>
            </div>
          </>
        )}
      </Modal>
    </Card>
  );
}
