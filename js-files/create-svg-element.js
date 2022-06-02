const createElement = (elementName, attributes) => {
    const setAttribute = (element, attributes) => {
        Object
            .entries(attributes)
            .forEach(([ attribute, value ]) => {
                if (attribute === 'textContent') {
                    element[attribute] = value;
                } else {
                    element.setAttribute(attribute, value);
                }
            });
    }

    const element = document.createElementNS('http://www.w3.org/2000/svg', elementName);

    if (attributes) {
        setAttribute(element, attributes);
    }

    return element;
}
