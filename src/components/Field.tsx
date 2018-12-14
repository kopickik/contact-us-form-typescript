import * as React from 'react'
import { IValues, IFormContext, FormContext, IErrors } from './Form'

type Editor = "textbox" | "multilinetextbox" | "dropdown"

export interface IValidation {
  rule: (values: IValues, fieldName: string, args: any) => string
  args?: any
}

export interface IFieldProps {
  id: string
  label?: string
  editor?: Editor
  options?: string[]
  value?: any
  validation?: IValidation
}

export const Field: React.SFC<IFieldProps> = ({
  id,
  label,
  editor,
  options,
  value
}) => {
  const getError = (errors: IErrors): string => (errors ? errors[id] : "")
  const getEditorStyle = (errors: IErrors): any => {
    return getError(errors) ? { borderColor: "red" } : {}
  }
  return (
    <FormContext.Consumer>
      {(context: IFormContext) => (
        <div className="form-group">
        {label && <label htmlFor={id}>{label}</label>}

        {editor!.toLowerCase() === "textbox" && (
          <input
            id={id}
            type="text"
            value={value}
            onChange={
              (e: React.FormEvent<HTMLInputElement>) => context.setValues({ [id]: e.currentTarget.value })
            }
            onBlur={() => context.validate(id)}
            className="form-control"
            style={getEditorStyle(context.errors)}
          />
        )}
        {editor!.toLowerCase() === "multilinetextbox" && (
          <textarea
            id={id}
            value={value}
            onChange={
              (e: React.FormEvent<HTMLTextAreaElement>) => context.setValues({ [id]: e.currentTarget.value })
            }
            onBlur={() => context.validate(id)}
            className="form-control"
            style={getEditorStyle(context.errors)}
          />
        )}
        {editor!.toLowerCase() === "dropdown" && (
          <select
            id={id}
            name={id}
            value={value}
            onChange={
              (e: React.FormEvent<HTMLSelectElement>) => context.setValues({ [id]: e.currentTarget.value })
            }
            onBlur={() => context.validate(id)}
            className="form-control"
            style={getEditorStyle(context.errors)}
          >{ options &&
            options.map(option => <option key={option} value={option}>{option}</option>)
          }
          </select>
        )}
        {getError(context.errors) && (
          <div style={{ color: "red", fontSize: "80%"}}>
            <p>{getError(context.errors)}</p>
          </div>
        )}
      </div>
      )}
      </FormContext.Consumer>
  )
}

Field.defaultProps = {
  editor: "textbox"
}
