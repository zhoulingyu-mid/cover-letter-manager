import React from "react";
import Spinner from 'react-bootstrap/Spinner';
import style from './LoadingBlock.module.css';

const LoadingBlock: React.FC = () => {
  return (
    <div className = {style.LoadingBlock}>
      <Spinner animation="border" />
    </div>
  );
};

const LoadingBlockContainer: React.FC<React.PropsWithChildren> = ({children}) => {
  return (
    <div className = {style.LoadingBlockContainer}>
      {children}
    </div>
  );
};

export default LoadingBlock;
export {LoadingBlockContainer};