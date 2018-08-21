import React from 'react';
import {ModelController, Rule} from '../lib/model_ctrl';
import { IObserved } from '../lib/observe';
import {IModel, rules} from '../model/model';

// export default ({ name }) => 
//   <h1>Hello {name}!</h1>
// ;

type M = IModel;

export default class Form
  extends React.Component<{}, {
    obj: Partial<IModel>;
  }>
{
  componentWillMount() {
    const obj: IModel = {
      baseCurrency: null,
      bankAccountId: "CSMAIN",
      bankAccount: { currency: "USD" },
      legalEntityId: "CS",
      legalEntity: { currency: "GBP" },
      currency: "USD",
      currencyRate: 1.29343,
      netAmtBase: undefined,
      netAmtCurr: 100,
      taxAmtBase: undefined,
      taxAmtCurr: undefined,
      taxRate: 0.2,
      grossAmtBase: undefined,
      grossAmtCurr: undefined,

      crvCurrencyDefault: "GBP",
      crvCurrencyFixed: undefined
      // crv: {
      //   currency: { default: "GBP", fixed: false }
      // }
    };
    const mc = new ModelController(obj, rules);
    mc.observed.addPropertyListener(this);
    this.setState({
      obj: mc.observed
    });
  }

  render() {
    const {obj} = this.state;
    return (
      <Container>
        <Group header="Amounts">
          {this.renderValue("netAmtBase")}
          {this.renderField("netAmtCurr")}
          <hr />
          {this.renderValue("taxAmtBase")}  
          {this.renderField("taxRate")}
          {this.renderValue("taxAmtBase")}
          {this.renderValue("taxAmtCurr")}
          <hr />
          {this.renderValue("grossAmtBase")}
          {this.renderValue("grossAmtCurr")}
        </Group>
        <Group header="Base">
          {this.renderValue("baseCurrency")}
          {this.renderField("currency")}
          {this.renderField("currencyRate")}
        </Group>
        <Group header="CRV">
          {this.renderField("crvCurrencyDefault")}
          {this.renderField("crvCurrencyFixed")}
        </Group>
      </Container>
    );
  }

  renderValue(name: keyof IModel) {
    const { obj } = this.state;
    return <Field label={name}>
      <input type="text" disabled value={obj[name] as any as string || ""}/>
    </Field>;
  }

  renderField(name: keyof IModel) {
    const {obj} = this.state;
    return <Field label={name}>
      <TextField obj={obj} prop={name} value={obj[name]}/>
    </Field>;
  }

  onPropertyChanged(target, property: string, value: any, prevValue: any) {
    this.forceUpdate();
  }
}


class TextField<T, K extends keyof T>
  extends React.Component<{ 
    obj: T;
    prop: K;
    value: T[K];
  }, { 
    value: any;
  }>
{
  componentWillMount() {
    const { obj, prop, value } = this.props;
    this.setState({ value: value || "" });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.value != nextProps.value)
      this.setState({ value: nextProps.value || "" });
  }

  render() {
    const {obj, prop} = this.props;
    const {value} = this.state;
    return (
      <input 
        type="text"
        value={(value as any as string)} 
        onChange={this._onChange}
        placeholder="undefined"
      />
    );
  }

  _onChange = (ev) => {
    const value = ev.currentTarget.value;
    this.setState({value});
    const { obj, prop } = this.props;
    obj[prop] = value;
  }
}

const Field = ({ label, children }) => (
  <div style={{ display: 'flex', padding: 4, alignItems: 'center' }}>
    <div style={{ width: 90, textAlign: 'right', paddingRight: 5, overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}:</div>
    <div>{children}</div>
  </div>
);

const Container = ({ children }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap' }}>
    {children}
  </div>
)

const Group = ({ header, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', padding: 4, border: 'solid 1px #ccc', margin: 4, background: '#eee' }}>
    <div style={{ fontWeight: 'bold', color: '#ccc', textAlign: 'center', textTransform: 'uppercase', padding: 4, borderBottom: 'solid 1px #eee', marginBottom: 4 }}>{header}</div>
    <div>{children}</div>
  </div>
);


