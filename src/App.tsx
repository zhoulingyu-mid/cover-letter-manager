import { Tab, Tabs } from "react-bootstrap";
import PersonalExperiences from "src/views/PersonalExperiences";
import Companies from "./views/Companies";
import CoverLetterTemplates from "./views/CoverLetterTemplates";
import ImportExport from "./views/ImportExport";
import { DBProvider } from "src/context/DBContext";
import { ToastContainer } from 'react-toastify';

const App: React.FunctionComponent = () => {

  return (
    <div>
      <DBProvider>
        <h1>Create my cover letter</h1>
        <Tabs
          className="mb-3"
          defaultActiveKey="personal-experiences"
        >
          <Tab eventKey="personal-experiences" title="Personal Experiences">
            <PersonalExperiences/>
          </Tab>
          <Tab eventKey="companies" title="Companies">
            <Companies />
          </Tab>
          <Tab eventKey="cover-templates" title="Cover Letter Templates">
            <CoverLetterTemplates />
          </Tab>
          <Tab eventKey="import-export" title="Import/Export">
            <ImportExport />
          </Tab>
        </Tabs>
        <ToastContainer/>
      </DBProvider>
    </div>
  );
};

export default App;
