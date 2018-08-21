import { IObserved, Observed, observe, IPropertyListener} from './observe';

export class ModelController<T>
  implements IPropertyListener<T>
{
  constructor(obj: T, rules: RulesMap<T>)
  {
    const allProps = Object.keys(obj);
    this._obj = obj;
    this._observed = observe(obj, allProps, { capture: true });
    this._rules = rules;
    this._observed.addPropertyListener(this);

    // init allProps
    const props = this._props = {};
    for(let k of allProps) {
      const p = props[k] = {
        property: k,
        dependsOn: [],
        dependants: {},
        rules: rules[k];
      };
    }
    
    for (let k in props)
      this.evaluateProperty(props[k]);

    console.log(props);
  }

  _obj: T;
  _observed: Observed<T>;
  _rules: RulesMap<T>;

  _props: { [key:keyof T]: Property<T> };

  public get observed(): IObserved<T> {
    return this._observed;
  }

  onPropertyChanged(target: T, property: keyof T, value: any, prevValue: any)
  {
    console.log("⚡ %s:  %s => %s ", property, prevValue, value);
  }

  private evaluateProperty(prop: Property<T>) {
    console.log(' 💡 evaluating %s', prop.property);

    prop.rules.forEach(r => {
      
    });
  }

  private evaluate(property: keyof T, rule: Rule<T>) {
    const {_observed: observed, _props: props} = this;
    
    console.log(' 💡 evaluating %s', property);
    let value;
    const captures = observed.capture(() => {
      value = rule(observed);
    });

    captures.forEach(([k,v]) => {
      props[property].dependsOn.push(k);
      props[k].dependants[property] = true;
      console.log(k);
    });

    console.log('\t- js: %s', rule.toString());
    console.log('\t- depends: [%s]', captures.map(i => i[0]).join(', '));
    console.log('\t=>', value);
  }

}

type Property<T> = {
  property: keyof T;
  dependsOn: Array<keyof T>;
  dependants: { [prop: keyof T]: int };
  rules: Rules<T>;
};

type RulesMap<T> = {
  [key: keyof T]: Rules<T>;
}

type Rules<T> = (i: T) => any;

interface IRule<T> {
  resolver: (i: T) => any;
  lastEval: [Array<any>, any];
//  deps: 
};


export const enum Rule {
  Constraint, Default, Validate
}