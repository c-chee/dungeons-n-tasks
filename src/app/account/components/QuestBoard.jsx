'use client';

import React from 'react';
import GuildContainer from './cards/GuildCardContainer';
import PartyContainer from './cards/PartyCardContainer';

export default function QuestBoard({ data }) {
    const { guild, party, quests } = data || {};

    if (!quests) return <div>Loading quests...</div>;

    return (
        <div className='space-y-6'>
            <GuildContainer guild={guild} guildQuests={quests.guildQuests} />
            <PartyContainer party={party} partyQuests={quests.partyQuests} />
        </div>
    );
}