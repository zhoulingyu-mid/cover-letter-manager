import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate, faGear, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useCallback, useEffect, useState } from "react";
import { Button, Card, Stack } from "react-bootstrap";
import { useDB } from "src/context/DBContext";
import CreateExperienceModal from "src/views/CreateExperienceModal";
import UpdateExperienceModal from 'src/views/UpdateExperienceModal';
import { Experience } from 'src/model/db';


const PersonalExperiences: React.FunctionComponent = () => {
  const db = useDB();
  const [experiences, setExperiences] = useState<ReadonlyArray<Experience>>([]); // null means querying
  const [showAddExperienceModal, setShowAddExperienceModal] = useState<boolean>(false);
  const [experienceUUIDToUpdate, setExperienceUUIDToUpdate] = useState<string | null>(null);  // uuid of the experience to edit
  
  const syncAllExperiences = useCallback(
    async()=>{
      if (db == null) {
        return null;
      }
      const storage = await db.listAll(['experiences']);
      const allExperiences = storage['experiences'];
      setExperiences(allExperiences);
    },
    [db]
  );

  useEffect(
    ()=>{
      syncAllExperiences();
    },
    [syncAllExperiences]
  );

  if (db == null) {
    return null;
  }
  return (
    <div>
      <div className='d-flex justify-content-between mx-3'>
        <h3>Personal Experiences</h3>
        <Stack direction='horizontal' gap={1}>
          <Button size='sm' onClick={syncAllExperiences}><FontAwesomeIcon icon={faArrowsRotate} /></Button>
          <Button size='sm' onClick={()=>setShowAddExperienceModal(true)}><FontAwesomeIcon icon={faPlus} /></Button>
        </Stack>
      </div>
      <div className='d-grid' style={{gridTemplateColumns: 'repeat(auto-fill, minmax(600px, 1fr))'}}>
        {experiences.map((exp, idx) => (
          <Card key={idx} className='mx-3'>
            <Card.Body>
              <Card.Title>
                <div className='d-flex justify-content-between mx-3'>
                  <b>{exp.name}</b>
                  <Stack direction='horizontal' gap={1}>
                    <Button size='sm' onClick={()=>setExperienceUUIDToUpdate(exp.uuid)}>
                      <FontAwesomeIcon icon={faGear} />
                    </Button>
                    <Button size='sm' onClick={
                      ()=>{
                        db.delete({
                          'experiences': [exp.uuid],
                          companies: [],
                          jobs: [],
                          templates: []
                        });
                        syncAllExperiences();
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
      <CreateExperienceModal
        show={showAddExperienceModal}
        onConfirm={()=>{
          setShowAddExperienceModal(false);
          syncAllExperiences();
        }}
        onCancel={()=>setShowAddExperienceModal(false)}
      />
      <UpdateExperienceModal
        uuid={experienceUUIDToUpdate}
        onConfirm={()=>{
          setExperienceUUIDToUpdate(null);
          syncAllExperiences();
        }}
        onCancel={()=>setExperienceUUIDToUpdate(null)}
      />
    </div>
  );
};

export default PersonalExperiences;
