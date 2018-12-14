import * as React from 'react'
import { IFieldProps } from './Field'

interface IFormProps {
  // the http path the form will be posted to
  action: string

  fields: IFields

  render: () => React.ReactNode
}

export interface IFields {
  [key: string]: IFieldProps
}

export interface IFormContext extends IFormState {
  setValues: (values:IValues) => void
  validate: (fieldName: string) => void
}

export const FormContext = React.createContext<IFormContext | undefined>(undefined)

export interface IValues {
  [key: string]: any
}

export interface IErrors {
  [key: string]: string
}

export interface IFormState {
  values: IValues

  errors: IErrors

  submitSuccess?: boolean
}

export const required = (values: IValues, fieldName: string): string => {
  return values[fieldName] === undefined ||
  values[fieldName] === null ||
  values[fieldName] === ""
    ? "This cannot be empty." : ""
}

export const isEmail = (values: IValues, fieldName: string): string => {
  return values[fieldName] &&
    values[fieldName].search(
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
    )
      ?  "Email format is invalid." : ""
}

export const maxLength = (values: IValues, fieldName: string, length: number): string => {
  return values[fieldName] &&
    values[fieldName].length > length
    ?  `This field can not exceed ${length} characters.` : ""
}

export class Form extends React.Component<IFormProps, IFormState> {
  constructor(props: IFormProps) {
    super(props)

    const errors: IErrors = {}
    const values: IValues = {}
    this.state = {
      errors,
      values
    }
  }

  private haveErrors(errors: IErrors) {
    let haveError: boolean = false
    Object.keys(errors).map((key: string) => {
      if (errors[key].length) {
        haveError = true
      }
    })
    return haveError
  }

  private handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault()

    console.log(this.state.values)

    if (this.validateForm()) {
      const submitSuccess: boolean = await this.submitForm()
      this.setState({ submitSuccess })
    }
  }

  private validate = (fieldName: string): string => {
    let newError: string = ""
    if (
      this.props.fields[fieldName] &&
        this.props.fields[fieldName].validation
    ) {
      newError = this.props.fields[fieldName].validation!.rule(
        this.state.values,
        fieldName,
        this.props.fields[fieldName].validation!.args
      )
    }
    this.state.errors[fieldName] = newError
    this.setState({
      errors: { ...this.state.errors, [fieldName]: newError }
    })
    return newError
  }

  private validateForm(): boolean {
    const errors: IErrors = {}
    Object.keys(this.props.fields).map((fieldName: string) => {
      errors[fieldName] = this.validate(fieldName)
    })
    this.setState({ errors })
    return !this.haveErrors(errors)
  }

  private async submitForm(): Promise<boolean> {
    try {
      const response = await fetch(this.props.action, {
        method: "POST",
        headers: new Headers({
          "Content-Type": "application/json",
          Accept: "application/json"
        }),
        body: JSON.stringify(this.state.values)
      })
      return response.ok
    } catch (err) {
      return false;
    }
  }

  private setValues = (values: IValues) => {
    this.setState({ values: { ...this.state.values, ...values }})
  }

  public render() {
    const { submitSuccess, errors } = this.state
    const context: IFormContext = {
      ...this.state,
      setValues: this.setValues,
      validate: this.validate
    }

    return (
      <FormContext.Provider value={context}>
        <form onSubmit={this.handleSubmit} noValidate={true}>
          <div className="container">
            {this.props.render()}
            <div className="form-group">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={this.haveErrors(errors)}
              >Submit
              </button>
            </div>
            {submitSuccess && (
              <div className="alert alert-info" role="alert">
                The form was successfully submitted.
              </div>
            )}
            {submitSuccess === false && !this.haveErrors(errors) && (
              <div className="alert alert-danger" role="alert">
                An unexpected error occurred.
              </div>
            )}
            {submitSuccess === false && this.haveErrors(errors) && (
              <div className="alert alert-danger" role="alert">
                The form is invalid.  Please review, adjust, and try again.
              </div>
            )}
          </div>
        </form>
      </FormContext.Provider>
    )
  }
}
