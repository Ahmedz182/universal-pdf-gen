from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="pdf-gen",
    version="1.0.0",
    author="Ahmed Fayyaz",
    author_email="iamahmedfayyaz@gmail.com",
    description="Python PDF generation with templates",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/Ahmedz182/universal-pdf-gen",
    packages=find_packages(),
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.8",
    install_requires=[
        "reportlab>=3.6.0",
        "pillow>=9.0.0",
        "svglib>=1.5.0",
    ],
    entry_points={
        "console_scripts": [
            "pdf-gen=pdf_gen.cli:main",
        ],
    },
)
