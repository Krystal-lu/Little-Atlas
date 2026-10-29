import React from 'react';
import { Compass, BookOpen, Mail, Shield, Plus, Calendar, ArrowUpRight } from 'lucide-react';
import { ActiveTab } from '../types';
interface HeaderProps { activeTab: ActiveTab; onSelectTab: (tab: ActiveTab) => void; placesCount: number; isSample: boolean; onToggleSample: () => void; onClearData: () => void; onOpenAddModal?: () => void; }
export const Header: React.FC<HeaderProps> = ({activeTab,onSelectTab,placesCount,isSample,onToggleSample,onOpenAddModal}) => (
  <header className="atlas-header">
    <button className="atlas-brand" onClick={()=>onSelectTab('atlas')} aria-label="Little Atlas home"><Compass size={26}/><span>little atlas<small>A personal record of being there</small></span></button>
    <nav className="atlas-nav" aria-label="Main navigation">
      {([{id:'atlas',label:'Places',icon:Compass},{id:'journeys',label:'Timeline',icon:BookOpen},{id:'postcards',label:'Postcards',icon:Mail},{id:'plan-trip',label:'Plan a trip',icon:Calendar}] as const).map(({id,label,icon:Icon})=><button key={id} aria-current={activeTab===id?'page':undefined} onClick={()=>onSelectTab(id)}><Icon size={16}/>{label}{id==='atlas'&&placesCount>0&&<span className="nav-count">{placesCount}</span>}</button>)}
    </nav>
    <div className="atlas-header-actions"><button className="atlas-secondary sample-toggle" onClick={onToggleSample}>{isSample?'Back to my atlas':'Explore demo'}<ArrowUpRight size={15}/></button><button className="atlas-icon" onClick={()=>onSelectTab('privacy')} aria-label="Storage and privacy"><Shield size={18}/></button><button className="atlas-primary" onClick={onOpenAddModal}><Plus size={17}/>Add memory</button></div>
  </header>
);
