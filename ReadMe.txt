To get the application running, you'll need to:

Open PowerShell as Administrator

Navigate to the project directory:

cd c:\Users\forre\Desktop\TheFinalCut_Node
Install dependencies:

npm install
Start the server:

node server.js
The application will then be available at http://localhost:3000.







As an Administrator, you can set the execution policy by typing this into your PowerShell window:


Set-ExecutionPolicy RemoteSigned

When you are done, you can set the policy back to its default value with:

Set-ExecutionPolicy Restricted
