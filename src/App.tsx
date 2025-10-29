import { createContext, useContext, useMemo, useState, useEffect, useId, useCallback } from 'react';
import './App.css';

type TabItem = {
  id: string;
  contentId: string | null;
  isActive?: boolean;
}

type TabsContextType = {
  tabs: TabItem[];
  activeContentId: string | null;
  setActiveContentId: (contentId: string | null) => void;
  registerTrigger: (id: string) => void;
  registerContent: (contentId: string) => void;
}

const TabsContext = createContext<TabsContextType | null>(null);

const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('useTabsContext must be used within a TabsProvider');
  }
  return context;
}

interface RootTabsProps {
  children: React.ReactNode;
}

function RootTabs(props: RootTabsProps) {
  const {
     children,
  } = props;
  const [tabs, setTabs] = useState<TabItem[]>([]);
  const [activeContentId, setActiveContentId] = useState<string | null>(null);
  
  const registerTrigger = useCallback((id: string) => {
    setTabs(prev => {
      if (prev.find(tab => tab.id === id)) return prev;

      return [...prev, {id, contentId: null, isActive: false}];
    })
  }, [])

  const registerContent = useCallback((contentId: string) => {
    setTabs(prev => {
      const alreadyRegistered = prev.some(tab => tab.contentId === contentId);
      if (alreadyRegistered) {
        console.log('Content already registered');
        return prev;
      }

      const lastUnregistred = prev.find(tab => tab.contentId === null);
      
      if (lastUnregistred === undefined) {
        console.log('All tabs are registered');
        return prev;
      }

      const triggerId = lastUnregistred.id;
      
      return prev.map(tab => 
        tab.id === triggerId ? { ...tab, contentId } : tab
      );
    })

    setActiveContentId(prev => {
      if (!prev) {
        return contentId;
      }
      return prev;
    });
  }, []);

  const contextValue = useMemo(() => ({
    tabs,
    activeContentId,
    setActiveContentId,
    registerTrigger,
    registerContent,
  }), [tabs, activeContentId, setActiveContentId, registerTrigger, registerContent]);

  return (
    <TabsContext.Provider value={contextValue}>
      {children}
    </TabsContext.Provider>
  )
}

function TabsContent ({children}: {children: React.ReactNode}) {
   const {activeContentId, registerContent} = useTabsContext();

   const contentId = useId();

   useEffect(() => {
    registerContent(contentId);
   }, [contentId, registerContent])

   return activeContentId === contentId ? (
    <div className='tabs-content'>
      {children}
    </div>
   ) : null;
}

function TabsList  ({children, style}: {children: React.ReactNode, style?: React.CSSProperties}) {
  return (
    <div className='tabs-list' style={style}>
      {children}
    </div>
  )
}

function TabsTrigger ({children, disabled}: {children: React.ReactNode, disabled?: boolean}) {
  const {registerTrigger, tabs, setActiveContentId, activeContentId} = useTabsContext();

  const triggerId = useId();

  useEffect(() => {
    registerTrigger(triggerId);
  }, [triggerId, registerTrigger]);

  const myTab = tabs.find(tab => tab.id === triggerId);
  const isActive = myTab?.contentId === activeContentId;

  const handleClick = useCallback(() => {
    if (myTab?.contentId) {
      setActiveContentId(myTab.contentId);
    }
  }, [myTab, setActiveContentId]);

  const style = isActive ? {backgroundColor: 'blue', color: 'white'} : {};

  return (
    <button className='tabs-trigger' onClick={handleClick} disabled={disabled} style={style}>
      {children}
    </button>
  )
}

function TabsNavigate () {
  const {activeContentId, setActiveContentId, tabs} = useTabsContext();

  if (!activeContentId) return null;

  const handlePrev = () => {
    const currentIndex = tabs.findIndex(tab => tab.contentId === activeContentId);
    if (currentIndex === -1) return;
    
    if (currentIndex === 0) {
      const lastTab = tabs[tabs.length - 1];
      if (lastTab?.contentId) {
        setActiveContentId(lastTab.contentId);
      }
    } else {
      const prevTab = tabs[currentIndex - 1];
      if (prevTab?.contentId) {
        setActiveContentId(prevTab.contentId);
      }
    }
  }

  const handleNext = () => {
    const currentIndex = tabs.findIndex(tab => tab.contentId === activeContentId);
    if (currentIndex === -1) return;
    
    if (currentIndex === tabs.length - 1) {
      const firstTab = tabs[0];
      if (firstTab?.contentId) {
        setActiveContentId(firstTab.contentId);
      }
    } else {
      const nextTab = tabs[currentIndex + 1];
      if (nextTab?.contentId) {
        setActiveContentId(nextTab.contentId);
      }
    }
  }

  return (
    <div className='tabs-navigate'>
      <button className='tabs-navigate-button' onClick={handlePrev}>
        {"<"}
      </button>
      <button className='tabs-navigate-button' onClick={handleNext}>
        {">"}
      </button>
    </div>
  )
}

type TabsComponent = typeof RootTabs & {
  Content: typeof TabsContent;
  List: typeof TabsList;
  Trigger: typeof TabsTrigger;
  Navigate: typeof TabsNavigate;
}

const Tabs: TabsComponent = Object.assign(RootTabs, {
  Content: TabsContent,
  List: TabsList,
  Trigger: TabsTrigger,
  Navigate: TabsNavigate,
});

type ModalContextType = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const ModalContext = createContext<ModalContextType | null>(null);

const useModalContext = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModalContext must be used within a ModalProvider');
  }
  return context;
}

function RootModal ({children}: {children: React.ReactNode}) {
  const [isOpen, setIsOpen] = useState(false);

  const contextValue = useMemo(() => ({
    isOpen,
    setIsOpen,
  }), [isOpen, setIsOpen]);

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
    </ModalContext.Provider>
  )
}

function ModalOverlay () {
  const {isOpen, setIsOpen} = useModalContext();

  if (!isOpen) return null;

  const handleClick = () => {
    console.log('clicked');
    setIsOpen(false);
  }

  return (
    <div className='modal-overlay' onClick={handleClick}/>
  )
}

function ModalTrigger ({children}: {children: React.ReactNode}) {
  const {setIsOpen} = useModalContext();

  return (
    <button onClick={() => setIsOpen(true)} className='modal-trigger'>
      {children}
    </button>
  )
}

function ModalContent ({children}: {children: React.ReactNode}) {
  const {isOpen, setIsOpen} = useModalContext();

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, setIsOpen]);

  return isOpen ? (
    <div className='modal-content'>
      {children}
    </div>
  ) : null;
}

function ModalContainer ({children}: {children: React.ReactNode}) {
  return (
    <div className='modal-container'>
      {children}
    </div>
  )
}

function ModalBody ({children}: {children: React.ReactNode}) {
  return (
    <div className='modal-body'>
      {children}
    </div>
  )
}

function ModalFooter ({children}: {children: React.ReactNode}) {
  return (
    <div className='modal-footer'>
      {children}
    </div>
  )
}

function ModalCloseButton () {
  const {setIsOpen} = useModalContext();

  return (
    <button className='modal-close-button' onClick={() => setIsOpen(false)}>
      {"X"}
    </button>
  )
}

type ModalComponent = typeof RootModal & {
  Overlay: typeof ModalOverlay;
  Trigger: typeof ModalTrigger;
  Content: typeof ModalContent;
  Container: typeof ModalContainer;
  Body: typeof ModalBody;
  Footer: typeof ModalFooter;
  CloseButton: typeof ModalCloseButton;
}

const Modal: ModalComponent = Object.assign(RootModal, {
  Overlay: ModalOverlay,
  Trigger: ModalTrigger,
  Content: ModalContent,
  Container: ModalContainer,
  Body: ModalBody,
  Footer: ModalFooter,
  CloseButton: ModalCloseButton,
});

export function App() {
  return (
    <div className='app'>
      <Tabs>
        <Tabs.List>
          <Tabs.Trigger >Tab 1</Tabs.Trigger>
          <Tabs.Trigger >Tab 2</Tabs.Trigger>
          <Tabs.Trigger>Tab 3</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content >Привет</Tabs.Content>
        <Tabs.Content >Как дела? Как погода?</Tabs.Content>
        <Tabs.Content >Азаза</Tabs.Content>
        <Tabs.Navigate />
      </Tabs>

      <Modal>
        <Modal.Trigger>Open Modal</Modal.Trigger>
        <Modal.Content>
          <Modal.Overlay />
          <Modal.Container>
            <Modal.Body>Hello</Modal.Body>
            <Modal.Footer>
              <div>Footer</div>
              <Modal.CloseButton />
            </Modal.Footer>
          </Modal.Container>
        </Modal.Content>
      </Modal>
    </div>
    
  )
}