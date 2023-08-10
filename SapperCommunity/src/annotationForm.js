import React , { useState, useEffect} from 'react';
import { DragDropContext,Droppable, Draggable } from 'react-beautiful-dnd';
import './annotationForm.css'
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import {Input } from 'antd';
const { TextArea } = Input;

const CommentForm = ({section, NLPDesc, handleChange, handleRemove, ...props}) => {
  return (
    <>
      <div className={`d-flex justify-content-between align-items-center`} style={{ alignItems: 'center' }}>
        <div className={`d-flex`} style={{textAlign: 'left' }}>
            <p>Comment</p>
            <div className={`NLPDesc-message`}>{NLPDesc}</div>
        </div>
        <div style={{textAlign: 'right'}}>
            <i className='fa fa-times-circle' onClick={()=>handleRemove(section.sectionId)}>
            </i>
        </div>
      </div>
      <TextArea
        value={section.content}
        onChange={(e)=>handleChange(section.sectionId, {...section, content: e.target.value})}
        // placeholder="Controlled autosize"
        autoSize={{
          minRows: 1,
        }}
      />
    </>
  );
};

const DescriptionForm = ({section, NLPDesc, handleChange, handleRemove, ...props }) => {
  return (
    <>
      <div className={`d-flex justify-content-between align-items-center`} style={{ alignItems: 'center' }}>
        <div className={`d-flex`} style={{textAlign: 'left' }}>
            <p>Description</p>
            <div className={`NLPDesc-message`}>{NLPDesc}</div>
        </div>
        <div style={{textAlign: 'right'}}>
            <i className='fa fa-times-circle' onClick={()=>handleRemove(section.sectionId)}>
            </i>
        </div>
      </div>
      <TextArea
        value={section.content}
        onChange={(e)=>handleChange(section.sectionId, {...section, content: e.target.value})}
        // placeholder="Controlled autosize"
        autoSize={{
          minRows: 1,
        }}
      />
    </>
  );
};

const FormatForm = ({section, NLPDesc, handleChange, handleRemove, ...props }) => {
  return (
    <>
      <div className={`d-flex justify-content-between align-items-center`} style={{ alignItems: 'center' }}>
        <div className={`d-flex`} style={{textAlign: 'left' }}>
            <p className={`sub-section-message`}>Output Format</p>
            <div className={`NLPDesc-message`}>{NLPDesc}</div>
        </div>
        <div style={{textAlign: 'right'}}>
            <i className='fa fa-times-circle' onClick={()=>handleRemove(section.sectionId)}>
            </i>
        </div>
      </div>
      <TextArea
        value={section.content}
        onChange={(e)=>handleChange(section.sectionId, {...section, content: e.target.value})}
        // placeholder="Controlled autosize"
        autoSize={{
          minRows: 1,
        }}
      />
    </>
  );
};

const NameForm = ({section, NLPDesc, handleChange, handleRemove, ...props }) => {
  return (
    <>
      <div className={`d-flex justify-content-between align-items-center`} style={{ alignItems: 'center' }}>
        <div className={`d-flex`} style={{textAlign: 'left' }}>
            <p className={`sub-section-message`}>Name</p>
            <div className={`NLPDesc-message`}>{NLPDesc}</div>
        </div>
        <div style={{textAlign: 'right'}}>
            <i className='fa fa-times-circle' onClick={()=>handleRemove(section.sectionId)}>
            </i>
        </div>
      </div>
      <input
        value={section.content}
        onChange={(e)=>handleChange(section.sectionId, {...section, content: e.target.value})}
        className="form-control"
        style={{ resize: 'none' }}
        {...props}
      />
    </>
  );
};

const ExampleForm = ({section, NLPDesc, handleChange, handleRemove, ...props }) => {
    const content = section.content;
  return (
    <>
      <div className={`d-flex justify-content-between align-items-center`} style={{ alignItems: 'center' }}>
        <div className={`d-flex`} style={{textAlign: 'left' }}>
            <p>Example</p>
            <div className={`NLPDesc-message`}>{NLPDesc}</div>
        </div>
        <div style={{textAlign: 'right'}}>
            <i className='fa fa-times-circle' onClick={()=>handleRemove(section.sectionId)}>
            </i>
        </div>
      </div>
      <div style={{textAlign: 'left'}}>
        Input:
      </div>
      <TextArea
        value={content.input}
        onChange={(e)=>handleChange(section.sectionId, {...section, content: {...content, 'input': e.target.value}})}
        autoSize={{
          minRows: 1,
        }}
      />
      <div style={{textAlign: 'left', paddingTop: '10px'}}>
        Output:
      </div>
      <TextArea
        value={content.output}
        onChange={(e)=>handleChange(section.sectionId, {...section, content: {...content, 'output': e.target.value}})}
        autoSize={{
          minRows: 1,
        }}
      />
    </>
  );
};

const ItemForm = ({section, NLPDesc ,handleChange, handleRemove, ...props})=>{
  const content = section.content;
  const handleRulesChange = (index, value) => {
    const updatedRules = [...content];
    updatedRules[index] = value;
   handleChange(section.sectionId, {...section, content: updatedRules});
  };

  const handleRemoveRules = (index) => {
    const updatedRules = [...content];
    updatedRules.splice(index, 1);
    handleChange(section.sectionId, {...section, content: updatedRules});
  };

  const handleAddRules = (index) => {
    const updatedRules = [...content];
    updatedRules.push('')
   handleChange(section.sectionId, {...section, content: updatedRules});
  };

  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    const updatedRules = [...content];
    const [removedField] = updatedRules.splice(sourceIndex, 1);
    updatedRules.splice(destinationIndex, 0, removedField);
    handleChange(section.sectionId, {...section, content: updatedRules});
  };

  return(
      <>
        <div className={`d-flex justify-content-between align-items-center`} style={{ alignItems: 'center' }}>
        <div className={`d-flex`} style={{textAlign: 'left' }}>
            <p>{section.sectionType}</p>
            <div className={`NLPDesc-message`}>{NLPDesc}</div>
        </div>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="items">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
            {content.map((rule, index) => (
              <Draggable key={index} draggableId={`item-${index+1}`} index={index}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.draggableProps}>
                    <div style={{ display: 'flex', alignItems: 'center' }} key={index}>
                      <div className="input-group mb-3" {...provided.dragHandleProps}>
                        <div style={{display: "flex", alignItems: 'center', paddingRight: '5px', paddingLeft: '5px', backgroundColor: '#e2ebf0'}}>
                          {index + 1}
                        </div>
                        <div className={`flex-grow-1`}>
                            <TextArea
                              value={rule}
                              onChange={(e) => handleRulesChange(index, e.target.value)}
                              autoSize={{
                                  minRows: 1,
                              }}
                            />
                        </div>
                      </div>
                      <div style={{paddingLeft: '5px', paddingBottom: '15px'}}>
                        <OverlayTrigger placement="top" overlay={<Tooltip>Remove {section.sectionType}</Tooltip>}>
                            <i
                              className="fa fa-minus"
                              style={{ fontSize: '12px', cursor: 'pointer' }}
                              onClick={() => handleRemoveRules(index)}
                            />
                        </OverlayTrigger>
                      </div>
                    </div>
                  </div>)}
                </Draggable>
                ))}
                {provided.placeholder}
                <div style={{textAlign: 'left', padding: '0', marginLeft: '8px'}}>
                  <OverlayTrigger placement="top" overlay={<Tooltip>Add {section.sectionType}</Tooltip>}>
                   <i
                      className="fa fa-plus"
                      style={{ fontSize: '12px', cursor: 'pointer' }}
                      onClick={() => handleAddRules(-1)}
                   />
                  </OverlayTrigger>
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </>
  )
}

const RuleForm = ({section, NLPDesc, handleChange, handleRemove, ...props}) =>{
    return(
        <ItemForm NLPDesc={NLPDesc} section={section} handleChange={handleChange} handleRemove={handleRemove}>
        </ItemForm>
    )
}

const CommandForm = ({section, NLPDesc, handleChange, handleRemove, ...props}) =>{
    return(
        <ItemForm NLPDesc={NLPDesc} section={section} handleChange={handleChange} handleRemove={handleRemove}>
        </ItemForm>
    )
}

const TermForm = ({section, NLPDesc, handleChange, handleRemove, ...props}) =>{
    return(
        <ItemForm NLPDesc={NLPDesc} section={section} handleChange={handleChange} handleRemove={handleRemove}>
        </ItemForm>
    )
}

const FormButton = ({defaultValues, handleChange }) => {
  const addAnnotation = (type) => () => {
    const defaultValue = defaultValues[type];
    const section = {sectionId: 'S' + Date.now().toString(), sectionType: type, content: defaultValue}
    handleChange(section);
  };

  return (
    <div style={{ textAlign: 'right' }}>
      <div className="dropstart" style={{ width: '100px !important' }}>
        <button type="button" className="form-button" data-bs-toggle="dropdown">
          Add Sub-section
        </button>
        <ul className="dropdown-menu custom-dropdown-menu">
          {Object.keys(defaultValues).map((type) => (
            <li key={type}>
              <div className="dropdown-item" onClick={addAnnotation(type)}>
                {type}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const PareButton = ({ handleChange }) => {
  const componentTypes = [
    { type: 'Metadata', initialState: { id: Date.now(), annotationType: 'Metadata', section: [{sectionId: "S1" + Date.now().toString(), sectionType: 'Description', content: '\n'}] } },
    { type: 'Persona', initialState: { id: Date.now(), annotationType: 'Persona', section: [{sectionId: "S1" + Date.now().toString(), sectionType: 'Description', content: '\n'}] } },
    { type: 'Audience', initialState: { id: Date.now(), annotationType: 'Audience', section: [{sectionId: "S1" + Date.now().toString(), sectionType: 'Description', content: '\n'}] } },
    { type: 'Terminology', initialState: { id: Date.now(), annotationType: 'Terminology', section: [{sectionId: "S1" + Date.now().toString(), sectionType: 'Terms', content: ['']}] } },
    { type: 'ContextControl', initialState: { id: Date.now(), annotationType: 'ContextControl', section: [{sectionId: "S1" + Date.now().toString(), sectionType: 'Rules', content: ['']}] } },
    { type: 'Instruction', initialState: { id: Date.now(), annotationType: 'Instruction', section: [{sectionId: "S1" + Date.now().toString(), sectionType: 'Name', content: ''}, {sectionId: "S2" + Date.now().toString(), sectionType: 'Commands', content: ['']}] } },
  ];

  const addAnnotation = (type) => () => {
    const componentType = componentTypes.find((component) => component.type === type);
    if (componentType) {
      handleChange(componentType.initialState);
    }
  };

  return (
    <div style={{ textAlign: 'right' }}>
      <div className="dropstart" style={{ width: '100px !important' }}>
        <button type="button" className="form-button" data-bs-toggle="dropdown">
          <i className="fa fa-plus">
          </i> Add Section
        </button>
        <ul className="dropdown-menu custom-dropdown-menu">
          {componentTypes.map((component) => (
            <li key={component.type}>
              <div className="dropdown-item" onClick={addAnnotation(component.type)}>
                {component.type}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const EmptyForm = () =>{
    return(
        <div className={'container'} style={{padding: '5px', border: '2px dashed #9bc5c3', backgroundColor: 'white', height: '100px', textAlign: 'center'}}>
            <p style={{fontSize: '2em', fontFamily: 'Exo, serif'}}>
                Click Add a Component to start creating your prompt.
            </p>
        </div>
    )
}

const InitForm = ({SectionIndex, SectionDesc, SectionName = '', field, defaultValues, warnInfo=[], handleFieldChange, handleRemoveField, dragHandle}) => {
  const handleContentRemove = (sectionId) => {
    const updatedSections = field.section.filter((section) => section.sectionId !== sectionId);
    handleFieldChange(field.id, {...field, section: Array.from(updatedSections)});
  }

  const handleAppendSection = (section, position)=>{
      const updatedSections = [...field.section];
      if(section.sectionType === 'Name'){
          updatedSections.splice(0, 0, section);
      }
      else {
          updatedSections.push(section);
      }
      handleFieldChange(field.id, {...field, section: Array.from(updatedSections)});
  }

  const handleContentChange = (sectionId, value) => {
    const updatedSections = field.section.map((section) => {
      if (section.sectionId === sectionId) {
        return value;
      }
      return section;
    });
    handleFieldChange(field.id, {...field, section: Array.from(updatedSections)});
  };

  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    const updatedSections = Array.from(field.section);
    const [removedField] = updatedSections.splice(sourceIndex, 1);
    updatedSections.splice(destinationIndex, 0, removedField);
    handleFieldChange(field.id, {...field, section: Array.from(updatedSections)});
  }

  const componentMap = {
    Name: NameForm,
    Comment: CommentForm,
    Rules: RuleForm,
    Terms: TermForm,
    Description: DescriptionForm,
    Format: FormatForm,
    Commands: CommandForm,
    Example: ExampleForm,
  };

  const descriptionMap = {
    Name: "",
    Comment: "",
    Rules: "Restrictions on this section",
    Terms: "For some specific nouns in specific hints",
    Description: "",
    Format: "Output format you want this instruction to be ",
    Commands: "the action you want this instruction to perform",
    Example: "According to \"Output Format\", you can give an example ",
  }
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className={`card`} style={{backgroundColor: '#9bc5c3'}}>
        <div
            className={`form-group-nav d-flex justify-content-between align-items-center`}
        >
            <div
                className="nav-left"
                style={{display: 'flex', alignItems: 'center', paddingLeft: '5px'}}
            >
                <div className="circle" {...dragHandle}>{SectionIndex + 1}</div>
                <div style={{
                    fontSize: '18px',
                    marginLeft: '8px',
                    cursor: 'pointer'
                }}>{SectionName !=='' ? SectionName : field.annotationType}</div>
                <div className={`section-message`}>
                    {SectionDesc}
                </div>
            </div>
            <div className="d-flex nav-right">
                {(warnInfo && warnInfo.length===0) ? '' :
                    <div style={{position: 'relative'}}>
                        <div id={"warnInfo" + field.id} className={`collapse`} style={{ position: 'absolute', top: '20px' , right: '30%', zIndex: '1001', padding: '5px',backgroundColor: '#cfd9df', border: '1px solid gray', fontSize: '15px'}}>
                            {warnInfo.map((warn, index) => {
                            return (
                                <div style={{whiteSpace: 'nowrap'}}>{index+1}: {warn}</div>
                            )
                            })}
                        </div>
                        <div data-bs-toggle="collapse" data-bs-target={"#warnInfo" + field.id}>
                            <i className="fa fa-warning" style={{color: 'black'}} >
                            </i>{warnInfo.length}
                        </div>
                    </div>
                }
                <OverlayTrigger placement="top"
                                overlay={<Tooltip>Remove Section</Tooltip>}>
                    <div style={{paddingLeft: '10px'}}>
                    <i
                        className="fa fa fa-times-circle"
                        style={{
                            fontSize: '18px',
                            marginRight: '8px',
                            cursor: 'pointer'
                        }}
                        onClick={() => handleRemoveField(field.id)}
                    />
                    </div>
                </OverlayTrigger>
            </div>
        </div>
      <div className={'container'} style={{padding: '5px', border: '2px solid #9bc5c3', backgroundColor: 'white'}}>
        <Droppable droppableId="components" direction="vertical">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {field.section.map((section, index) => {
                if (componentMap[section.sectionType]) {
                  const Component = componentMap[section.sectionType];
                  const NLPDesc = descriptionMap[section.sectionType];
                  return (
                    <Draggable key={section.sectionId} draggableId={section.sectionId} index={index}>
                      {(provided) => (
                        <React.Fragment>
                          <div ref={provided.innerRef} {...provided.draggableProps} >
                            <div style={{display:'flex', textAlign: 'center'}}>
                                <div style={{textAlign: "center", width: '10px'}} >
                                    <i
                                    className="fa fa-list"
                                    style={{ fontSize: '12px', marginRight: '2px'}}
                                    {...provided.dragHandleProps}
                                    />
                                </div>
                                <div className='container' style={{paddingLeft: '5px'}}>
                                <Component
                                  NLPDesc={NLPDesc}
                                  section={section}
                                  handleChange={handleContentChange}
                                  handleRemove={handleContentRemove}
                                />
                                <hr/>
                                </div>
                            </div>
                          </div>
                        </React.Fragment>
                      )}
                    </Draggable>
                  );
                }
                return null;
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
        <FormButton defaultValues={defaultValues} handleChange={handleAppendSection}/>
      </div>
      </div>
    </DragDropContext>
  );
};

const MetadataForm = ({SectionIndex, SectionDesc, field, handleFieldChange, handleRemoveField, dragHandle}) => {
  const defaultValues = {
    Name: '',
    Comment: '\n',
    Description: '\n',
  };
  const initialWarnInfos = [];
  const [warnInfo, setWarnInfo] = useState(initialWarnInfos)

  useEffect(() => {
    const checkField = [...field.section];
    const updateWarnInfo = [];
    const existSection = [];
    checkField.forEach((section, index) => {
        existSection.push(section.sectionType);
        if(section.sectionType ==='Description' && section.content.replace("\n", '') === ''){
            updateWarnInfo.push(`The index of ${index+1} Description is empty`)
        }
        if(section.sectionType ==='Comment' && section.content.replace("\n", '') === ''){
            updateWarnInfo.push(`The index of ${index+1} Comment is empty`)
        }
        if(section.sectionType ==='Rules' && section.content.filter(x => x !== '').length === 0){
            updateWarnInfo.push(`The index of ${index+1} Rules is empty`)
        }
    })
    const warnInfoChange = JSON.stringify(warnInfo) !== JSON.stringify(updateWarnInfo);
    if(warnInfoChange){
        setWarnInfo(updateWarnInfo)
    }
  }, [field]);

  return (
    <InitForm SectionIndex={SectionIndex} SectionDesc={SectionDesc} dragHandle={dragHandle} field={field} defaultValues={defaultValues} warnInfo={warnInfo} handleRemoveField={handleRemoveField} handleFieldChange={handleFieldChange}>
      {/* 在这里可以添加自定义的子组件或覆盖原有的子组件 */}
    </InitForm>
  );
};

const PrimingForm = ({SectionIndex, SectionDesc, field, handleFieldChange, handleRemoveField, dragHandle}) => {
  const defaultValues = {
    Name: '',
    Rules: [''],
    Terms: [''],
    Comment: '\n',
    Description: '\n',
  };

  const initialWarnInfos = [];
  const [warnInfo, setWarnInfo] = useState(initialWarnInfos)

  useEffect(() => {
    const checkField = [...field.section];
    const updateWarnInfo = [];
    const existSection = [];
    checkField.forEach((section, index) => {
        existSection.push(section.sectionType);
        if(section.sectionType ==='Description' && section.content.replace("\n", '') === ''){
            updateWarnInfo.push(`The index of ${index+1} Description is empty`)
        }
        if(section.sectionType ==='Comment' && section.content.replace("\n", '') === ''){
            updateWarnInfo.push(`The index of ${index+1} Comment is empty`)
        }
        if(section.sectionType ==='Rules' && section.content.filter(x => x !== '').length === 0){
            updateWarnInfo.push(`The index of ${index+1} Rules is empty`)
        }
        if(section.sectionType ==='Terms' && section.content.filter(x => x !== '').length === 0){
            updateWarnInfo.push(`The index of ${index+1} Terms is empty`)
        }
    })
    const warnInfoChange = JSON.stringify(warnInfo) !== JSON.stringify(updateWarnInfo);
    if(warnInfoChange){
        setWarnInfo(updateWarnInfo)
    }
  }, [field]);

  return (
    <InitForm SectionIndex={SectionIndex} SectionDesc={SectionDesc} dragHandle={dragHandle} field={field} defaultValues={defaultValues} warnInfo={warnInfo} handleRemoveField={handleRemoveField} handleFieldChange={handleFieldChange}>
      {/* 在这里可以添加自定义的子组件或覆盖原有的子组件 */}
    </InitForm>
  );
};

const ContextControlForm = ({SectionIndex, SectionDesc, field, handleFieldChange, handleRemoveField, dragHandle}) => {
  const defaultValues = {
    Rules: [''],
    Terms: [''],
    Comment: '\n',
    Description: '\n',
  };
  const initialWarnInfos = [];
  const [warnInfo, setWarnInfo] = useState(initialWarnInfos)

  useEffect(() => {
    const checkField = [...field.section];
    const updateWarnInfo = [];
    const existSection = [];
    checkField.forEach((section, index) => {
        existSection.push(section.sectionType);
        if(section.sectionType ==='Description' && section.content.replace("\n", '') === ''){
            updateWarnInfo.push(`The index of ${index+1} Description is empty`)
        }
        if(section.sectionType ==='Comment' && section.content.replace("\n", '') === ''){
            updateWarnInfo.push(`The index of ${index+1} Comment is empty`)
        }
        if(section.sectionType ==='Rules' && section.content.filter(x => x !== '').length === 0){
            updateWarnInfo.push(`The index of ${index+1} Rules is empty`)
        }
        if(section.sectionType ==='Terms' && section.content.filter(x => x !== '').length === 0){
            updateWarnInfo.push(`The index of ${index+1} Terms is empty`)
        }
    })
    const warnInfoChange = JSON.stringify(warnInfo) !== JSON.stringify(updateWarnInfo);
    if(warnInfoChange){
        setWarnInfo(updateWarnInfo)
    }
  }, [field]);

  return (
    <InitForm SectionIndex={SectionIndex} SectionDesc={SectionDesc} SectionName={"Context Control"} dragHandle={dragHandle} field={field} defaultValues={defaultValues} warnInfo={warnInfo} handleRemoveField={handleRemoveField} handleFieldChange={handleFieldChange}>
      {/* 在这里可以添加自定义的子组件或覆盖原有的子组件 */}
    </InitForm>
  );
};

const AudienceForm = ({SectionIndex, SectionDesc, field, handleFieldChange, handleRemoveField, dragHandle}) => {
  const defaultValues = {
    Name: '',
    Description: '\n',
    Comment: '\n',
    Rules: [''],
  };
  const initialWarnInfos = [];
  const [warnInfo, setWarnInfo] = useState(initialWarnInfos)

  useEffect(() => {
    const checkField = [...field.section];
    const updateWarnInfo = [];
    const existSection = [];
    checkField.forEach((section, index) => {
        existSection.push(section.sectionType);
        if(section.sectionType ==='Description' && section.content.replace("\n", '') === ''){
            updateWarnInfo.push(`The index of ${index+1} Description is empty`)
        }
        if(section.sectionType ==='Comment' && section.content.replace("\n", '') === ''){
            updateWarnInfo.push(`The index of ${index+1} Comment is empty`)
        }
        if(section.sectionType ==='Rules' && section.content.filter(x => x !== '').length === 0){
            updateWarnInfo.push(`The index of ${index+1} Rules is empty`)
        }
        if(section.sectionType ==='Terms' && section.content.filter(x => x !== '').length === 0){
            updateWarnInfo.push(`The index of ${index+1} Terms is empty`)
        }
    })
    const warnInfoChange = JSON.stringify(warnInfo) !== JSON.stringify(updateWarnInfo);
    if(warnInfoChange){
        setWarnInfo(updateWarnInfo)
    }
  }, [field]);

  return (
    <InitForm SectionIndex={SectionIndex} SectionDesc={SectionDesc} dragHandle={dragHandle} field={field} defaultValues={defaultValues} warnInfo={warnInfo} handleRemoveField={handleRemoveField} handleFieldChange={handleFieldChange}>
      {/* 在这里可以添加自定义的子组件或覆盖原有的子组件 */}
    </InitForm>
  );
};

const PersonaForm = ({SectionIndex, SectionDesc, field, handleFieldChange, handleRemoveField, dragHandle}) => {
  const defaultValues = {
    Name: '',
    Description: '\n',
    Comment: '\n',
    Rules: [''],
  };
  const initialWarnInfos = [];
  const [warnInfo, setWarnInfo] = useState(initialWarnInfos)

  useEffect(() => {
    const checkField = [...field.section];
    const updateWarnInfo = [];
    const existSection = [];
    checkField.forEach((section, index) => {
        existSection.push(section.sectionType);
        if(section.sectionType ==='Description' && section.content.replace("\n", '') === ''){
            updateWarnInfo.push(`The index of ${index+1} Description is empty`)
        }
        if(section.sectionType ==='Comment' && section.content.replace("\n", '') === ''){
            updateWarnInfo.push(`The index of ${index+1} Comment is empty`)
        }
        if(section.sectionType ==='Rules' && section.content.filter(x => x !== '').length === 0){
            updateWarnInfo.push(`The index of ${index+1} Rules is empty`)
        }
        if(section.sectionType ==='Terms' && section.content.filter(x => x !== '').length === 0){
            updateWarnInfo.push(`The index of ${index+1} Terms is empty`)
        }
    })
    const warnInfoChange = JSON.stringify(warnInfo) !== JSON.stringify(updateWarnInfo);
    if(warnInfoChange){
        setWarnInfo(updateWarnInfo)
    }
  }, [field]);

  return (
    <InitForm SectionIndex={SectionIndex} SectionDesc={SectionDesc} dragHandle={dragHandle} field={field} defaultValues={defaultValues} warnInfo={warnInfo} handleRemoveField={handleRemoveField} handleFieldChange={handleFieldChange}>
      {/* 在这里可以添加自定义的子组件或覆盖原有的子组件 */}
    </InitForm>
  );
};

const TerminologyForm = ({SectionIndex, SectionDesc, field, handleFieldChange, handleRemoveField, dragHandle}) => {
  const defaultValues = {
    Name: '',
    Terms: [''],
    Description: '\n',
    Comment: '\n',
    Rules: [''],
  };
  const initialWarnInfos = [];
  const [warnInfo, setWarnInfo] = useState(initialWarnInfos)

  useEffect(() => {
    const checkField = [...field.section];
    const updateWarnInfo = [];
    const existSection = [];
    checkField.forEach((section, index) => {
        existSection.push(section.sectionType);
        if(section.sectionType ==='Description' && section.content.replace("\n", '') === ''){
            updateWarnInfo.push(`The index of ${index+1} Description is empty`)
        }
        if(section.sectionType ==='Comment' && section.content.replace("\n", '') === ''){
            updateWarnInfo.push(`The index of ${index+1} Comment is empty`)
        }
        if(section.sectionType ==='Rules' && section.content.filter(x => x !== '').length === 0){
            updateWarnInfo.push(`The index of ${index+1} Rules is empty`)
        }
        if(section.sectionType ==='Terms' && section.content.filter(x => x !== '').length === 0){
            updateWarnInfo.push(`The index of ${index+1} Terms is empty`)
        }
    })
    if(!existSection.includes('Terms')){
        updateWarnInfo.push('Need to add Terms');
    }
    const warnInfoChange = JSON.stringify(warnInfo) !== JSON.stringify(updateWarnInfo);
    if(warnInfoChange){
        setWarnInfo(updateWarnInfo)
    }
  }, [field]);

  // 在这里可以添加自定义的逻辑或处理特定的props
  return (
    <InitForm SectionIndex={SectionIndex} SectionDesc={SectionDesc} dragHandle={dragHandle} field={field} defaultValues={defaultValues} warnInfo={warnInfo} handleRemoveField={handleRemoveField} handleFieldChange={handleFieldChange}>
      {/* 在这里可以添加自定义的子组件或覆盖原有的子组件 */}
    </InitForm>
  );
};

const InstructionForm = ({SectionIndex, SectionDesc, field, handleFieldChange, handleRemoveField, dragHandle}) => {
  const defaultValues = {
    Name: '',
    Commands: [''],
    Comment: '\n',
    Rules: [''],
    Format: '\n',
    Example: { "input": '\n', "output": '\n' },
  };
  const initialWarnInfos = [];
  const [warnInfo, setWarnInfo] = useState(initialWarnInfos)

  useEffect(() => {
    const checkField = [...field.section];
    const updateWarnInfo = [];
    const existSection = [];
    checkField.forEach((section, index) => {
        existSection.push(section.sectionType);
        if(section.sectionType ==='Description' && section.content.replace("\n", '') === ''){
            updateWarnInfo.push(`The index of ${index+1} Description is empty`)
        }
        if(section.sectionType ==='Comment' && section.content.replace("\n", '') === ''){
            updateWarnInfo.push(`The index of ${index+1} Comment is empty`)
        }
        if(section.sectionType ==='Format' && section.content.replace("\n", '') === ''){
            updateWarnInfo.push(`The index of ${index+1} Format is empty`)
        }
        if(section.sectionType ==='Example' && section.content.input.replace("\n", '') === ''){
            updateWarnInfo.push(`The index of ${index+1} Input in the Example is empty`)
        }
        if(section.sectionType ==='Example' && section.content.output.replace("\n", '') === ''){
            updateWarnInfo.push(`The index of ${index+1} Output in the Example is empty`)
        }
        if(section.sectionType ==='Commands' && section.content.filter(x => x !== '').length === 0){
            updateWarnInfo.push(`The index of ${index+1} Commands is empty`)
        }
        if(section.sectionType ==='Rules' && section.content.filter(x => x !== '').length === 0){
            updateWarnInfo.push(`The index of ${index+1} Rules is empty`)
        }
        if(section.sectionType ==='Terms' && section.content.filter(x => x !== '').length === 0){
            updateWarnInfo.push(`The index of ${index+1} Terms is empty`)
        }
    })
    if(existSection.includes('Format') && !existSection.includes('Example')){
        updateWarnInfo.push('Suggest adding Example');
    }
    const warnInfoChange = JSON.stringify(warnInfo) !== JSON.stringify(updateWarnInfo);
    if(warnInfoChange){
        setWarnInfo(updateWarnInfo)
    }
  }, [field]);

  return (
    <InitForm SectionIndex={SectionIndex} SectionDesc={SectionDesc} dragHandle={dragHandle} field={field} defaultValues={defaultValues} warnInfo={warnInfo} handleRemoveField={handleRemoveField} handleFieldChange={handleFieldChange}>
      {/* 在这里可以添加自定义的子组件或覆盖原有的子组件 */}
    </InitForm>
  );
};

export { PrimingForm, AudienceForm, PersonaForm, TerminologyForm, MetadataForm, ContextControlForm, InstructionForm, EmptyForm, FormButton, PareButton};
