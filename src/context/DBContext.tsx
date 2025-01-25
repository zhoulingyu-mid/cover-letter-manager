import React, { createContext, useContext, useEffect, useActionState, startTransition} from 'react';
import { Button } from 'react-bootstrap';
import LoadingBlock, {LoadingBlockContainer} from 'src/component/LoadingBlock';
import { DatabaseConnector } from 'src/model/db';


const DBContext = createContext<DatabaseConnector | null>(null);

function DBProvider ({children}: React.PropsWithChildren) {
  const [db, connectDB, isPending] = useActionState<DatabaseConnector | null>(
    async ()=>{
      const db = await DatabaseConnector.create();
      return db;
    },
    null,
  );

  useEffect(
    ()=>{
      startTransition(()=>{
        connectDB()
      });
    },
    [connectDB]
  )

  return (
    <LoadingBlockContainer>
      {db==null &&
        <div>
          Database is not connected
          <Button onClick={connectDB}>Connect Database</Button>
        </div>
      }
      <DBContext.Provider value={db}>
        {children}
      </DBContext.Provider>
      {isPending && <LoadingBlock />}
    </LoadingBlockContainer>
  );
}

function useDB(): DatabaseConnector | null{
  const db = useContext(DBContext);
  return db;
}

export default DBContext;
export {DBProvider, useDB};