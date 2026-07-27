import { useParams } from 'react-router';
import { SchemaEditor } from '../components/features/index.js';

const Schema = () => {
  const { schemaId } = useParams();
  const schemaIndex = parseInt(schemaId, 10);
  return <SchemaEditor schemaIndex={schemaIndex} />;
};

export default Schema;