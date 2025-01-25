import { useState } from "react";
import { Button } from "react-bootstrap";
import ExportModal from "src/views/ExportModal";



const ImportExport: React.FunctionComponent = () => {
  const [showExportModal, setShowExportModal] = useState(false);

  return (
    <div>
      <Button
        onClick={()=>{
          setShowExportModal(true);
        }}
      >
        Export
      </Button>
      <ExportModal show={showExportModal} onClose={()=>setShowExportModal(false)} />
    </div>
  );
};

export default ImportExport;
