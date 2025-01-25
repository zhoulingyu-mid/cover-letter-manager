import { useCallback, useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useDB } from "src/context/DBContext";
import { textToBlobHref } from "src/lib/textToBlobHref";

type ExportModalProps = {
  show: boolean;
  onClose: ()=>void;
};

const ExportModal: React.FC<ExportModalProps> = ({show, onClose}) => {
  const db = useDB();
  const [dbJson, setDBJson] = useState<object | null>(null);

  const handleCancel = ()=>{
    onClose();
  };

  const exportDB = useCallback(
    async ()=>{
      if (db == null) {
        return;
      }
      const dbJson = await db.export();
      setDBJson(dbJson);
    },
    [db]
  );

  useEffect(
    ()=> {
      if (! show){
        return;
      }
      exportDB();
    },
    [show, exportDB]
  );

  return (
    <Modal show={show} onHide={handleCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title>Update Job</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Button
          href={dbJson == null ? undefined : textToBlobHref(JSON.stringify(dbJson, null, 2))}
          target='_blank'
          disabled={dbJson == null}
        >
          Download
        </Button>
      </Modal.Body>
      <Modal.Footer>
          <div className="d-flex w-100 justify-content-between">
            <Button variant="primary" onClick={handleCancel}>
              Close
            </Button>
          </div>
      </Modal.Footer>
    </Modal>
  );
};

export default ExportModal;
