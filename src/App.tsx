import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import './App.css';

type TabsContextType = {
  value: string, 
  setValue: (value: string) => void, 
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
  value?: string;
  defaultActiveKey: string;
  onChange?: (value: string) => void;
}

function RootTabs(props: RootTabsProps) {
  const {
     children,
     value, 
     defaultActiveKey, 
     onChange 
  } = props;

  const [internalValue, setInternalValue] = useState(defaultActiveKey);
  
  const isControlled = value !== undefined;

  const activeKey = isControlled ? value : internalValue;

  const setValue = (newValue: string) => {
    if (newValue === activeKey) return;

    if (isControlled) {
      onChange?.(newValue);
    } else {
      setInternalValue(newValue);
    }
  }

  const contextValue = useMemo(() => ({
    value: activeKey,
    setValue,
  }), [activeKey, setValue]);

  return (
    <TabsContext.Provider value={contextValue}>
      {children}
    </TabsContext.Provider>
  )
}

function TabsContent ({value, children}: {value: string, children: React.ReactNode}) {
   const {value: activeKey} = useTabsContext();

   return activeKey === value ? 
    (<div className='tabs-content'>
      {children}
    </div>) 
    : null;
}

function TabsList  ({children, style}: {children: React.ReactNode, style?: React.CSSProperties}) {
  return (
    <div className='tabs-list' style={style}>
      {children}
    </div>
  )
}

function TabsTrigger ({value, children, disabled}: {value: string, children: React.ReactNode, disabled?: boolean}) {
  const {value: activeKey, setValue} = useTabsContext();

  const isActive = activeKey === value;

  const style = isActive ? {backgroundColor: 'blue', color: 'white'} : {};

  return (
    <button className='tabs-trigger' onClick={() => setValue(value)} disabled={disabled} style={style} >
      {children}
    </button>
  )
}

function TabsNavigate () {
  const {value: activeKey, setValue} = useTabsContext();

  const handlePrev = () => {
    if (Number(activeKey) === 1) {
      setValue('3');
    } else {
      const newKey = String(Number(activeKey) - 1);
      setValue(newKey);
    }
  }

  const handleNext = () => {
    if (Number(activeKey) === 3) {
      setValue('1');
    } else {
      const newKey = String(Number(activeKey) + 1);
      setValue(newKey);
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
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

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
  const [activeTab, setActiveTab] = useState('1');
  return (
    <div className='app'>
      <Tabs defaultActiveKey='1' value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Trigger value='1'>Tab 1</Tabs.Trigger>
          <Tabs.Trigger value='2'>Tab 2</Tabs.Trigger>
          <Tabs.Trigger value='3'>Tab 3</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value='1'>Привет</Tabs.Content>
        <Tabs.Content value='2'>Как дела? Как погода?</Tabs.Content>
        <Tabs.Content value='3'>Азаза</Tabs.Content>
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