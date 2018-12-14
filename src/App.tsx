import * as React from "react"
import { ContactUsForm } from "./components/ContactUsForm";

class App extends React.Component {
    public render() {
        return (
            <div className="mt-3">
              <ContactUsForm />
            </div>
        )
    }
}

export default App
