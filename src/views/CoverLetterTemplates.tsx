import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate, faGear, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useCallback, useEffect, useState } from "react";
import { Button, Card, Stack } from "react-bootstrap";
import { useDB } from "src/context/DBContext";
import CreateTemplateModal from 'src/views/CreateTemplateModal';
import UpdateTemplateModal from 'src/views/UpdateTemplateModal';
import { Template } from 'src/model/db';



const CoverLetterTemplates: React.FunctionComponent = () => {
  const db = useDB();
  const [templates, setTemplates] = useState<ReadonlyArray<Template>>([]); // null means querying
  const [showAddTemplateModal, setShowAddTemplateModal] = useState<boolean>(false);
  const [templateUUIDToUpdate, setTemplateUUIDToUpdate] = useState<string | null>(null);  // uuid of the template to edit
  
  const syncAllTemplates = useCallback(
    async()=>{
      if (db == null) {
        return null;
      }
      const storage = await db.listAll(['templates']);
      const allTemplates = storage['templates'];
      setTemplates(allTemplates);
    },
    [db]
  );

  useEffect(
    ()=>{
      syncAllTemplates();
    },
    [syncAllTemplates]
  );

  if (db == null) {
    return null;
  }
  return (
    <div>
      <div className='d-flex justify-content-between mx-3'>
        <h3>Templates</h3>
        <Stack direction='horizontal' gap={1}>
          <Button size='sm' onClick={syncAllTemplates}><FontAwesomeIcon icon={faArrowsRotate} /></Button>
          <Button size='sm' onClick={()=>setShowAddTemplateModal(true)}><FontAwesomeIcon icon={faPlus} /></Button>
        </Stack>
      </div>
      <div className='d-grid' style={{gridTemplateColumns: 'repeat(auto-fill, minmax(600px, 1fr))'}}>
        {templates.map((exp, idx) => (
          <Card key={idx} className='mx-3'>
            <Card.Body>
              <Card.Title>
                <div className='d-flex justify-content-between mx-3'>
                  <b>{exp.name}</b>
                  <Stack direction='horizontal' gap={1}>
                    <Button size='sm' onClick={()=>setTemplateUUIDToUpdate(exp.uuid)}>
                      <FontAwesomeIcon icon={faGear} />
                    </Button>
                    <Button size='sm' onClick={
                      ()=>{
                        db.delete({
                          'templates': [exp.uuid]
                        });
                        syncAllTemplates();
                      }
                    }>
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </Stack>
                </div>
              </Card.Title>
              <Card.Text>
                {exp.content}
              </Card.Text>
            </Card.Body>
          </Card>
        ))}
      </div>
      <CreateTemplateModal
        show={showAddTemplateModal}
        onConfirm={()=>{
          setShowAddTemplateModal(false);
          syncAllTemplates();
        }}
        onCancel={()=>setShowAddTemplateModal(false)}
      />
      <UpdateTemplateModal
        uuid={templateUUIDToUpdate}
        onConfirm={()=>{
          setTemplateUUIDToUpdate(null);
          syncAllTemplates();
        }}
        onCancel={()=>setTemplateUUIDToUpdate(null)}
      />
    </div>
  );
};

export default CoverLetterTemplates;
