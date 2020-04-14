FROM jupyter/scipy-notebook:cf6258237ff9

ARG NB_USER=jovyan
ARG NB_UID=1000
ENV USER ${NB_USER}
ENV NB_UID ${NB_UID}
ENV HOME /home/${NB_USER}

RUN adduser --disabled-password \
    --gecos "Default user" \
    --uid ${NB_UID} \
    ${NB_USER}

#####
# Run any root commands here
USER root
RUN apt-get update

#RUN mkdir /usr/local/etc/jupyterhub
#ADD jupyterhub_config.py /usr/local/etc/jupyterhub/
#ADD jupyter_notebook_config.py /usr/local/etc/jupyter/
RUN mkdir /home/extensions
COPY extensions_student /home/extensions

WORKDIR /home/extensions
RUN jupyter nbextension install . --system
RUN jupyter nbextension enable cell --system
RUN jupyter nbextension enable codecell --system
RUN jupyter nbextension enable control --system
RUN jupyter nbextension enable debug --system
RUN jupyter nbextension enable disablenotebookextensions --system
RUN jupyter nbextension enable getattempts --system
RUN jupyter nbextension enable getquestion --system
RUN jupyter nbextension enable getsolutions --system
RUN jupyter nbextension enable insertcell --system
RUN jupyter nbextension enable jupyterevents --system
RUN jupyter nbextension enable jupyterlogger --system
RUN jupyter nbextension enable moveablecell --system
RUN jupyter nbextension enable reloadsolutions --system
RUN jupyter nbextension enable setcolorsandeditable --system
RUN jupyter nbextension enable showhints --system
RUN jupyter nbextension enable submit --system
RUN jupyter nbextension enable submitattempt --system
RUN jupyter nbextension enable submitcontainer --system
RUN jupyter nbextension enable submithack --system
RUN jupyter nbextension enable textcell --system
RUN jupyter nbextension enable url --system
RUN jupyter nbextension enable username --system

COPY /studentfakefiles/tree.json /usr/local/etc/jupyter/nbconfig/
COPY /studentfakefiles/notebook.json /usr/local/etc/jupyter/nbconfig/


# Make sure the contents of our repo are in ${HOME}
#COPY . ${HOME}
#USER root
RUN chown -R ${NB_UID} ${HOME}
USER ${NB_USER}

USER $NB_USER
WORKDIR /home/jovyan
#COPY requirements.txt /tmp/requirements.txt
#RUN conda install --file /tmp/requirements.txt
