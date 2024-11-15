---
categories:
- xpath
- java
date: 2014-01-30T00:00:00Z
Summary: How to select nodes with xPath and keep the file structure of the original
  document in java with dom4j
tags:
- xpath
- dom4j
title: Fun with xpath
aliases:
    - /fun-with-xpath.html
---

I had fun today at work when I had to design a program that allows users to select nodes with xPath but keep the same hierarchical structure as the original xml file.

The result with tests is available [on github](https://github.com/geowarin/xpath-dom4j).

For instance, the following xPath `/persons/person[@age > 18]/project[@language = 'java']`, would select the lines highlighted in the file below :

{{< gist geowarin 8720930 >}}

Normal xPath result would be a list of nodes like that

```xml
<project name='dom4j' language='java'/>
<project name='dom4j' language='java'/>
```

But the desired output should look like this :

```xml
<persons>
	<person name='Joe' age='26'>
		<project name='dom4j' language='java'/>
	</person>
	<person name='Jane' age='23'>
		<project name='dom4j' language='java'/>
	</person>
</persons>
```

So I decided to write a small class to handle this use case :

```java
public class XPathFilter {
    private final Document xmlDocument;

    public XPathFilter(String xml) {
        xmlDocument = readXml(xml);
    }

    public String filter(String xPath) {
        Element root = xmlDocument.getRootElement();
        List<Element> resultNodes = root.selectNodes(xPath);

        if (resultNodes.isEmpty()) {
            throw new IllegalStateException("No result found for xpath " + xPath);
        }

        deleteNonResultNodes(resultNodes);
        return write(root);
    }

    private void deleteNonResultNodes(List<Element> resultNodes) {
        Set<Element> nodesToKeep = new HashSet<>(resultNodes);
        Set<Element> parents;
        do {
            parents = getParentNodes(nodesToKeep);

            for (Element parent : parents) {
                List<Element> children = parent.elements();
                for (Element child : children) {
                    if (!nodesToKeep.contains(child)) {
                        parent.remove(child);
                    }
                }
            }
            nodesToKeep = new HashSet<>(parents);
        }
        while (!parents.isEmpty());
    }

    private Set<Element> getParentNodes(Collection<Element> nodes) {
        Set<Element> parents = new HashSet<>();
        for (Element node : nodes) {
            Element parent = node.getParent();
            if (parent != null) {
                parents.add(parent);
            }
        }
        return parents;
    }

    private Document readXml(String xml) {
        Document document;
        try (StringReader reader = new StringReader(xml)) {
            DocumentFactory factory = new DocumentFactory();
            SAXReader saxReader = new SAXReader();
            saxReader.setDocumentFactory(factory);
            document = saxReader.read(reader);
        } catch (DocumentException e) {
            throw new IllegalArgumentException(e);
        }
        return document;
    }

    private String write(Element rootElement) {
        Document documentOut = DocumentHelper.createDocument();
        documentOut.add((Element) rootElement.clone());

        StringWriter writer = new StringWriter();
        XMLWriter xmlWriter = new XMLWriter(writer, OutputFormat.createPrettyPrint());

        try {
            xmlWriter.write(documentOut);
        } catch (IOException e) {
            throw new IllegalStateException(e);
        } finally {
            try {
                xmlWriter.close();
            } catch (IOException ignored) {
            }
        }

        return writer.toString();
    }
}
```

The `readXml` and `write` methods are just standard _dom4j_ stuff.

The real code lies in the `deleteNonResultNodes` function which traverses XML nodes
from the results to the root.
On each level, we will look at the parents of the current nodes (the selected ones at first) and delete every child which is not a result.

The parents will become the current nodes and will keep on until we reach the root.
At this point we would have kept only the xml structure that actually wrap our xPath results.

That's all folks ! Check out the result [on github](https://github.com/geowarin/xpath-dom4j), unit tests included.
