import React, { useContext, useEffect, useRef } from 'react';
import { SandpackPreview, useSandpack } from '@codesandbox/sandpack-react';
import { ActionContext } from '../../../context/ActionContext';

function SandPackPreviewClient() {
  const previewRef = useRef(null);
  const { sandpack } = useSandpack();
  const {action, setAction} = useContext(ActionContext);

  useEffect(() => {
    if (previewRef.current) {
      GetSandpackClient();
    }
  }, [sandpack&&action]);

  const GetSandpackClient = async () => {
    
    if (previewRef.current) {
      const client = previewRef.current?.getClient();
      if (client) {
        console.log(client);
        const result = await client.getCodeSandboxURL();
        console.log(result);
        if(action?.actionType == 'deploy') {
            window.open("https://codesandbox.io/embed/"+result.sandboxId);
        } else if(action?.actionType == 'download') {
            window.open("https://codesandbox.io/s/"+result.sandboxId);
        }
      }
    }
  };

  return (
    <div style={{ height: '80vh', width: '100%' }}> 
      <SandpackPreview 
        ref={previewRef} 
        style={{ height: '100%' }} 
        showNavigator={true}
      />
    </div>
  );
}

export default SandPackPreviewClient;

