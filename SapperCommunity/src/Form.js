import React, { useState, useRef, useEffect} from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { PrimingForm, AudienceForm, TerminologyForm, MetadataForm, PersonaForm, ContextControlForm, InstructionForm, EmptyForm, PareButton} from './annotationForm';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import './Form.css'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Form = ({fields, handleDataChange, handleRun, handleFiller}) => {
    const FORM_COMPONENTS = {
      'Priming': PrimingForm,
      'Audience': AudienceForm,
      'Terminology': TerminologyForm,
      'Metadata': MetadataForm,
      'Persona': PersonaForm,
      'ContextControl': ContextControlForm,
      'Instruction': InstructionForm
    };

    const SectionDescMap={
      'Priming': "The prerequisite for the role",
      'Audience': "The target audience you want the role to serve",
      'Terminology': "For some specific nouns in specific hints",
      'Metadata': " You can enter your role version, author name, etc. here",
      'Persona': "The role you need the AI native service to play",
      'ContextControl': "Restrictions on the role",
      'Instruction': "The actions you want the role to perform"
    }

  const handleAppendField = (field) => {
      const updatedFields = [...fields];
      const fieldKey = field.annotationType;
      console.log(fieldKey);
      if (updatedFields.some((f) => f.annotationType === fieldKey) && fieldKey !== 'Instruction') {
          toast.error(`You can't add '${fieldKey}' repeatedly`);
          return;
      }
      updatedFields.push(field);
      handleDataChange(updatedFields);
  }

  const handleRemoveField = (id) => {
    const updatedFields = fields.filter((field) => field.id !== id);
    handleDataChange(updatedFields);
  };

  const handleFieldChange = (id, updatedField) => {
    const updatedFields = fields.map((field) => {
      if (field.id === id) {
        return updatedField;
      }
      return field;
    });
    handleDataChange(updatedFields);
  };

  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    const updatedFields = Array.from(fields);
    const [removedField] = updatedFields.splice(sourceIndex, 1);
    updatedFields.splice(destinationIndex, 0, removedField);
    handleDataChange(updatedFields);
  };

  const [navbarScrollTop, setNavbarScrollTop] = useState(0); // 记录导航栏的滚动位置
  const RefNavbar = useRef(null)

  useEffect(() => {
    // 监听 document 的点击事件
    document.addEventListener('click', handleDocumentClick);

    return () => {
      // 清除事件监听
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);

 const handleDocumentClick = (event) => {
    const { target } = event;
    const clickedForm = target.closest('.annotationForm');

    if (clickedForm) {
      const parentForm = document.getElementById('Form');
      const parentRect = parentForm.getBoundingClientRect();
      const formRect = clickedForm.getBoundingClientRect();
      setNavbarScrollTop(formRect.top + parentForm.scrollTop - parentRect.top);
    }
  };

  return (
    <React.Fragment>
      <ToastContainer
          position="top-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
      />
      <div className='container-fluid'>
          <div style={{width:'calc(100%)', float: 'left'}}>
            <DragDropContext onDragEnd={onDragEnd} direction="vertical">
              <div className="container">
                <div className="row align-items-center">
                  <Droppable droppableId="fields" direction="vertical">
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.droppableProps}>
                          {fields.length === 0 ? (
                            <EmptyForm/>
                          ) : (
                        fields.map((field, index) => {
                          const sectionDesc = SectionDescMap[field.annotationType];
                          return(
                            <Draggable key={field.id} draggableId={field.id.toString()} index={index}>
                                {(provided) => (
                                    <div ref={provided.innerRef} {...provided.draggableProps}
                                         className='annotationForm'>
                                        <div style={{paddingBottom: '5px'}}>
                                            {
                                                FORM_COMPONENTS[field.annotationType] &&
                                                React.createElement(FORM_COMPONENTS[field.annotationType], {
                                                    SectionIndex: index,
                                                    SectionDesc: sectionDesc,
                                                    field: field,
                                                    handleFieldChange: handleFieldChange,
                                                    handleRemoveField: handleRemoveField,
                                                    dragHandle: {...(provided.dragHandleProps)}
                                                })
                                            }
                                        </div>
                                    </div>
                                )}
                            </Draggable>
                          )}))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              </div>
            </DragDropContext>
            <div style={{padding: '30px'}}>
              <PareButton handleChange={handleAppendField}/>
            </div>
            <div style={{paddingLeft: '25px', paddingBottom: '20px'}}>
                {fields.length !==0 && (<button type="button"  className="btn btn-primary" onClick={()=>{handleRun()}}
            >Step3: Run Prompt</button>)}
            </div>
          </div>
          <div style={{width:'30px', float:'right', display: 'none'}} >
            <nav
              id='annotationNavbar'
              className="navbar custom-navbar"
              style={{top: navbarScrollTop, scrollBehavior: 'smooth', padding: '0'}}
              ref= {RefNavbar}
            >
              <ul className="navbar-nav">
                <li className="nav-item">
                  <OverlayTrigger placement="right" overlay={<Tooltip>Rule</Tooltip>}>
                    <i className="fa fa-balance-scale"></i>
                  </OverlayTrigger>
                </li>
                <li className="nav-item" draggable>
                  <OverlayTrigger placement="right" overlay={<Tooltip>Comment</Tooltip>}>
                    <i className="fa fa-edit"></i>
                  </OverlayTrigger>
                </li>
                <li className="nav-item" draggable>
                  <OverlayTrigger placement="right" overlay={<Tooltip>Comment</Tooltip>}>
                    <i className="fa fa-edit"></i>
                  </OverlayTrigger>
                </li>
                <li className="nav-item" draggable>
                  <OverlayTrigger placement="right" overlay={<Tooltip>Comment</Tooltip>}>
                    <i className="fa fa-edit"></i>
                  </OverlayTrigger>
                </li>
              </ul>
            </nav>
          </div>
        </div>
    </React.Fragment>
  );
};

export default Form;
